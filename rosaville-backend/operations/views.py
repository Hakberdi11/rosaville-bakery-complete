from decimal import Decimal

from django.db import models, transaction
from django.utils import timezone
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import CreateOnlyOrIsStaff, IsAdminOrManagerOrOwner, IsStaff

from .models import (
    Customer,
    Feedback,
    GiftCard,
    InventoryItem,
    LoyaltySettings,
    Order,
    PricingSettings,
    PurchaseOrder,
    PurchaseOrderLine,
    StockMovement,
    Supplier,
    Task,
)
from .serializers import (
    CustomerSerializer,
    FeedbackSerializer,
    PublicFeedbackSerializer,
    GiftCardSerializer,
    InventoryItemSerializer,
    LoyaltySettingsSerializer,
    OrderSerializer,
    PricingSettingsSerializer,
    PublicOrderStatusSerializer,
    PurchaseOrderSerializer,
    StockMovementSerializer,
    SupplierSerializer,
    TaskSerializer,
)
from .services import (
    compute_loyalty_discount,
    deduct_order_ingredients,
    order_deduction_net_by_item,
    price_order_items,
    reverse_order_ingredient_deduction,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related("supplier").all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    @action(detail=True, methods=["post"])
    def adjust(self, request, pk=None):
        item = self.get_object()
        try:
            delta = Decimal(str(request.data.get("delta")))
        except Exception:
            return Response({"detail": "delta must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        if item.current_stock + delta < 0:
            return Response({"detail": "Stock cannot go below zero"}, status=status.HTTP_400_BAD_REQUEST)
        reason = (request.data.get("reason") or "").strip()
        movement_type = request.data.get("movement_type") or StockMovement.MovementType.MANUAL_ADJUSTMENT
        if movement_type not in StockMovement.MovementType.values:
            return Response({"detail": "Invalid movement_type"}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user if request.user.is_authenticated else None
        item.apply_stock_movement(movement_type=movement_type, quantity_delta=delta, reason=reason, created_by=user)
        return Response(self.get_serializer(item).data)


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.select_related("inventory_item", "created_by").all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def get_queryset(self):
        qs = super().get_queryset()
        item_id = self.request.query_params.get("inventory_item")
        if item_id:
            qs = qs.filter(inventory_item_id=item_id)
        return qs


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related("supplier").prefetch_related("lines__inventory_item").all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def update(self, request, *args, **kwargs):
        po = self.get_object()
        if "lines" in request.data and po.status not in (PurchaseOrder.Status.DRAFT, PurchaseOrder.Status.SENT):
            raise ValidationError({"lines": "Cannot edit line items once receiving has started."})
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def receive(self, request, pk=None):
        po = self.get_object()
        if po.status == PurchaseOrder.Status.CANCELLED:
            return Response({"detail": "Cannot receive a cancelled purchase order."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            incoming = {int(line["line_id"]): Decimal(str(line["quantity_received"])) for line in request.data.get("lines", [])}
        except (KeyError, TypeError, ValueError):
            return Response({"detail": "lines must be [{line_id, quantity_received}]"}, status=status.HTTP_400_BAD_REQUEST)

        # Query PurchaseOrderLine directly rather than through po.lines — the
        # viewset's queryset prefetches lines__inventory_item, and po (from
        # self.get_object()) carries that prefetch cache; po.lines.all() would
        # keep returning the pre-mutation snapshot for the rest of this request.
        lines_by_id = {line.id: line for line in PurchaseOrderLine.objects.filter(purchase_order=po).select_related("inventory_item")}
        user = request.user if request.user.is_authenticated else None

        with transaction.atomic():
            for line_id, received_now in incoming.items():
                line = lines_by_id.get(line_id)
                if not line or received_now <= 0:
                    continue
                new_total = min(line.quantity_received + received_now, line.quantity_ordered)
                actual_delta = new_total - line.quantity_received
                if actual_delta <= 0:
                    continue
                line.quantity_received = new_total
                line.save(update_fields=["quantity_received"])
                line.inventory_item.apply_stock_movement(
                    movement_type=StockMovement.MovementType.RECEIVED,
                    quantity_delta=actual_delta,
                    related_purchase_order=po,
                    created_by=user,
                )

            all_lines = list(PurchaseOrderLine.objects.filter(purchase_order=po))
            fully_received = all(line.quantity_received >= line.quantity_ordered for line in all_lines)
            any_received = any(line.quantity_received > 0 for line in all_lines)
            if fully_received:
                po.status = PurchaseOrder.Status.RECEIVED
                po.received_date = timezone.now().date()
            elif any_received:
                po.status = PurchaseOrder.Status.PARTIALLY_RECEIVED
            po.save(update_fields=["status", "received_date", "updated_at"])

        # Re-fetch with a fresh prefetch cache so the response reflects this
        # request's mutations, not the stale snapshot from self.get_object().
        po = self.get_queryset().get(pk=po.pk)
        return Response(self.get_serializer(po).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [CreateOnlyOrIsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def get_permissions(self):
        if self.action == "lookup":
            return [AllowAny()]
        if self.action in ("mine", "cancel"):
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=["get"])
    def mine(self, request):
        """Order history for the logged-in customer's account (Account.tsx)."""
        orders = Order.objects.filter(customer__user=request.user).order_by("-created_at")
        return Response(OrderSerializer(orders, many=True).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Customer-initiated cancel from Account.tsx. Staff can always manage
        orders via the normal PATCH endpoint — this is the narrow self-service
        path, restricted to the one status combo proven side-effect-free: no
        stock has been deducted yet (only CONFIRMED+ triggers that, see
        perform_update above), and no payment has been taken."""
        order = self.get_object()
        is_staff = request.user.role in ("admin", "manager", "employee")
        is_owner = order.customer_id and order.customer.user_id == request.user.id
        if not is_staff and not is_owner:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        if order.status != Order.Status.PENDING or order.payment_status != Order.PaymentStatus.UNPAID:
            return Response(
                {"detail": "This order can no longer be cancelled — contact us if you need changes."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=["get"])
    def lookup(self, request):
        order_number = (request.query_params.get("order_number") or "").strip()
        email = (request.query_params.get("email") or "").strip()
        if not order_number or not email:
            return Response({"detail": "order_number and email are required"}, status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.filter(order_number__iexact=order_number, email__iexact=email).order_by("-created_at").first()
        if not order:
            return Response({"detail": "No order found with that order number and email."}, status=status.HTTP_404_NOT_FOUND)
        return Response(PublicOrderStatusSerializer(order).data)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        order = serializer.save()
        if order.status == Order.Status.CONFIRMED and old_status != Order.Status.CONFIRMED:
            # Guard against double-deduction (e.g. Confirmed set twice in a
            # row via separate requests) by checking net-of-movements is zero
            # rather than a simple "already ran once" flag — this also makes
            # Confirmed -> Cancelled -> Confirmed cycles deduct correctly again.
            if not order_deduction_net_by_item(order):
                deduct_order_ingredients(order)
        elif order.status in (Order.Status.CANCELLED, Order.Status.REFUNDED) and old_status not in (
            Order.Status.CANCELLED,
            Order.Status.REFUNDED,
        ):
            reverse_order_ingredient_deduction(order)

    def perform_create(self, serializer):
        redeem_reward = serializer.validated_data.pop("redeem_loyalty_reward", False)
        request = self.request
        is_staff = bool(
            request.user.is_authenticated and request.user.role in ("admin", "manager", "employee")
        )

        # --- Server-authoritative pricing ---------------------------------
        # Never trust the posted total_value. Recompute the subtotal from the
        # current catalog; staff orders may carry off-menu lines (walk-in /
        # phone quotes), the public checkout may not.
        priced_items, subtotal = price_order_items(
            serializer.validated_data.get("items"), allow_off_menu=is_staff
        )
        if is_staff and not priced_items:
            # Staff explicit-override path: an order with no line items at all
            # (a deposit, a bespoke quote) is whatever the owner typed.
            subtotal = Decimal(str(serializer.validated_data.get("total_value") or 0))
        loyalty_settings = LoyaltySettings.load()

        gift_card = None
        code = (serializer.validated_data.get("gift_card_code") or "").strip()
        amount = serializer.validated_data.get("gift_card_amount_applied") or Decimal("0")
        if code:
            try:
                gift_card = GiftCard.objects.get(code__iexact=code, is_active=True)
            except GiftCard.DoesNotExist:
                raise ValidationError({"gift_card_code": "No active gift card with this code."})
            if amount <= 0:
                raise ValidationError({"gift_card_amount_applied": "Amount must be greater than zero."})

        # Resolve the Customer this order belongs to: the logged-in customer's
        # own profile takes priority; otherwise fall back to matching by email
        # (guest checkout, or staff-entered orders) — same matching this app
        # used before the Order.customer FK existed.
        customer = None
        if request.user.is_authenticated and request.user.role == "customer":
            customer = getattr(request.user, "customer_profile", None)
        if customer is None and serializer.validated_data.get("email"):
            customer = Customer.objects.filter(email=serializer.validated_data["email"]).first()

        if redeem_reward and not (customer and customer.reward_available):
            raise ValidationError({"redeem_loyalty_reward": "No reward is available to redeem."})
        if redeem_reward and not loyalty_settings.enabled:
            raise ValidationError({"redeem_loyalty_reward": "The loyalty program is not currently active."})

        # The discount is worth what LoyaltySettings says, not what the browser
        # claimed it was worth.
        loyalty_discount = compute_loyalty_discount(subtotal, loyalty_settings) if redeem_reward else Decimal("0.00")
        total_value = max(Decimal("0.00"), subtotal - loyalty_discount)

        # A gift card is a payment, not a discount: it can never be "applied"
        # for more than the order is worth (or more than the card holds).
        if gift_card:
            amount = min(amount, gift_card.current_balance, total_value)
            if amount <= 0:
                raise ValidationError(
                    {"gift_card_amount_applied": "This gift card cannot be applied to this order."}
                )
        else:
            amount = Decimal("0")

        # A public checkout can only ever have "paid" the gift-card amount —
        # posting amount_paid/payment_status from the storefront would let
        # anyone mark their own order settled. Staff may record a deposit or
        # a walk-in cash payment on top.
        claimed_paid = (serializer.validated_data.get("amount_paid") or Decimal("0")) if is_staff else Decimal("0")
        amount_paid = min(max(claimed_paid, amount), total_value)
        if total_value > 0 and amount_paid >= total_value:
            payment_status = Order.PaymentStatus.PAID
        elif amount_paid > 0:
            payment_status = Order.PaymentStatus.PARTIALLY_PAID
        else:
            payment_status = Order.PaymentStatus.UNPAID

        order = serializer.save(
            customer=customer,
            items=priced_items,
            total_value=total_value,
            loyalty_discount_amount=loyalty_discount,
            gift_card_amount_applied=amount,
            amount_paid=amount_paid,
            payment_status=payment_status,
        )

        if gift_card:
            gift_card.current_balance -= amount
            gift_card.redemption_history = [
                {
                    "order_id": order.id,
                    "order_number": order.order_number,
                    "amount": str(amount),
                    "date": order.created_at.isoformat(),
                },
                *gift_card.redemption_history,
            ]
            gift_card.save(update_fields=["current_balance", "redemption_history", "updated_at"])

        # Simple punch-card loyalty: 1 point per whole dollar spent, plus the
        # owner-configured LoyaltySettings reward-threshold check.
        if customer:
            Customer.objects.filter(pk=customer.pk).update(
                loyalty_points=models.F("loyalty_points") + int(order.total_value),
                order_count=models.F("order_count") + 1,
                total_spend=models.F("total_spend") + order.total_value,
                last_order_date=order.created_at.date(),
                **({"reward_available": False} if redeem_reward else {}),
            )
            customer.refresh_from_db()

            if (
                loyalty_settings.enabled
                and loyalty_settings.purchases_required > 0
                and not customer.reward_available
                and customer.order_count % loyalty_settings.purchases_required == 0
            ):
                customer.reward_available = True
                customer.save(update_fields=["reward_available"])


class GiftCardViewSet(viewsets.ModelViewSet):
    queryset = GiftCard.objects.all()
    serializer_class = GiftCardSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    @action(detail=False, methods=["get"])
    def lookup(self, request):
        code = (request.query_params.get("code") or "").strip()
        if not code:
            return Response({"detail": "code is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            card = GiftCard.objects.get(code__iexact=code)
        except GiftCard.DoesNotExist:
            return Response({"detail": "Gift card not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.get_serializer(card).data)

    @action(detail=True, methods=["post"])
    def adjust(self, request, pk=None):
        card = self.get_object()
        try:
            delta = Decimal(str(request.data.get("delta")))
        except Exception:
            return Response({"detail": "delta must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        new_balance = card.current_balance + delta
        if new_balance < 0:
            return Response({"detail": "Balance cannot go below zero"}, status=status.HTTP_400_BAD_REQUEST)
        card.current_balance = new_balance
        card.save(update_fields=["current_balance", "updated_at"])
        return Response(self.get_serializer(card).data)

    @action(detail=True, methods=["post"])
    def void(self, request, pk=None):
        card = self.get_object()
        card.is_active = False
        card.save(update_fields=["is_active", "updated_at"])
        return Response(self.get_serializer(card).data)


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [CreateOnlyOrIsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"

    def get_permissions(self):
        if self.action == "public":
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=["get"])
    def public(self, request):
        """Featured testimonials for the public site (Testimonials.tsx) —
        owner marks entries Featured from the dashboard's feedback widget."""
        featured = Feedback.objects.filter(status=Feedback.Status.FEATURED).order_by("-created_at")[:12]
        return Response(PublicFeedbackSerializer(featured, many=True).data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAdminOrManagerOrOwner]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


class PricingSettingsView(generics.RetrieveUpdateAPIView):
    """Singleton resource for the automatic-pricing engine's business-wide
    inputs (target margin, labor rate, overhead/waste toggles). Unlike
    SiteContentView, this is staff-only for both read and write — it's
    internal financial data, never exposed to the public site."""

    serializer_class = PricingSettingsSerializer
    permission_classes = [IsStaff]

    def get_object(self):
        return PricingSettings.load()


class LoyaltySettingsView(generics.RetrieveUpdateAPIView):
    """Singleton resource for the owner-configured punch-card reward rule.
    Unlike PricingSettingsView, this is publicly readable (like SiteContentView)
    since the storefront shows customers their progress toward a reward."""

    serializer_class = LoyaltySettingsSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [IsStaff()]
        return [AllowAny()]

    def get_object(self):
        return LoyaltySettings.load()
