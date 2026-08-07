from django.db import models
from rest_framework import filters, viewsets

from accounts.permissions import CreateOnlyOrIsStaff, IsAdminOrManagerOrOwner, IsStaff

from .models import Customer, Feedback, InventoryItem, Order, Task
from .serializers import (
    CustomerSerializer,
    FeedbackSerializer,
    InventoryItemSerializer,
    OrderSerializer,
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

    def perform_create(self, serializer):
        order = serializer.save()
        # Simple punch-card loyalty: 1 point per whole dollar spent, awarded to
        # any existing Customer whose email matches the order. No customer
        # accounts/FK exist yet, so email is the only link available.
        if order.email:
            Customer.objects.filter(email=order.email).update(
                loyalty_points=models.F("loyalty_points") + int(order.total_value)
            )


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
