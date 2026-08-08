from rest_framework import serializers

from .models import Customer, Feedback, GiftCard, InventoryItem, Order, Supplier, Task


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class InventoryItemSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True, default="")

    class Meta:
        model = InventoryItem
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class PublicOrderStatusSerializer(serializers.ModelSerializer):
    """Subset of Order exposed to unauthenticated customers via OrderViewSet.lookup —
    deliberately excludes internal_notes, address, phone, and gift card fields."""

    class Meta:
        model = Order
        fields = ["order_number", "status", "payment_status", "items", "total_value", "delivery_date", "created_at"]


class GiftCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCard
        fields = "__all__"
        read_only_fields = ["id", "current_balance", "redemption_history", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["current_balance"] = validated_data["initial_balance"]
        return super().create(validated_data)


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True, default="")

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
