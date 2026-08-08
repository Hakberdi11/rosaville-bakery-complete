from decimal import Decimal

from django.db import models
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.permissions import CreateOnlyOrIsStaff, IsAdminOrManagerOrOwner, IsStaff

from .models import Customer, Feedback, GiftCard, InventoryItem, Order, Task
from .serializers import (
    CustomerSerializer,
    FeedbackSerializer,
    GiftCardSerializer,
    InventoryItemSerializer,
    OrderSerializer,
    PublicOrderStatusSerializer,
    TaskSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsStaff]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = "__all__"


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
