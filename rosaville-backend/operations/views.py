from decimal import Decimal

from django.db import models, transaction
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.permissions import CreateOnlyOrIsStaff, IsAdminOrManagerOrOwner, IsStaff

from .models import (
    Customer,
    Feedback,
    GiftCard,
    InventoryItem,
    Order,
    PurchaseOrder,
    PurchaseOrderLine,
    StockMovement,
    Supplier,
    Task,
)
from .serializers import (
    CustomerSerializer,
    FeedbackSerializer,
    GiftCardSerializer,
    InventoryItemSerializer,
    OrderSerializer,
    PublicOrderStatusSerializer,
    PurchaseOrderSerializer,
    StockMovementSerializer,
    SupplierSerializer,
    TaskSerializer,
)
from .services import deduct_order_ingredients, order_deduction_net_by_item, reverse_order_ingredient_deduction


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
        return super().get_permissions()

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
        gift_card = None
        code = (serializer.validated_data.get("gift_card_code") or "").strip()
        amount = serializer.validated_data.get("gift_card_amount_applied") or Decimal("0")
        if code:
            try:
                gift_card = GiftCard.objects.get(code__iexact=code, is_active=True)
            except GiftCard.DoesNotExist:
                raise ValidationError({"gift_card_code": "No active gift card with this code."})
            if amount <= 0 or amount > gift_card.current_balance:
                raise ValidationError({"gift_card_amount_applied": "Amount exceeds the gift card's balance."})

        order = serializer.save()

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

        # Simple punch-card loyalty: 1 point per whole dollar spent, awarded to
        # any existing Customer whose email matches the order. No customer
        # accounts/FK exist yet, so email is the only link available.
        if order.email:
            Customer.objects.filter(email=order.email).update(
                loyalty_points=models.F("loyalty_points") + int(order.total_value)
            )


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


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAdminOrManagerOrOwner]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"
