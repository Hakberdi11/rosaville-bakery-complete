from rest_framework import serializers

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


class PricingSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingSettings
        fields = [
            "target_margin_percent", "labor_hourly_rate", "overhead_percent",
            "waste_buffer_percent", "category_margin_overrides", "updated_at",
        ]
        read_only_fields = ["updated_at"]


class LoyaltySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltySettings
        fields = ["enabled", "purchases_required", "reward_type", "reward_value", "updated_at"]
        read_only_fields = ["updated_at"]


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

    def update(self, instance, validated_data):
        # current_stock may only change via InventoryItemViewSet.adjust (or,
        # later, PO receiving / order auto-deduction) — all of which go through
        # apply_stock_movement() so every change is audit-logged. A raw PATCH
        # here silently drops any current_stock key instead of erroring, since
        # older UI code may still send the field unchanged alongside real edits.
        validated_data.pop("current_stock", None)
        return super().update(instance, validated_data)


class StockMovementSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(source="inventory_item.name", read_only=True, default="")
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default="")

    class Meta:
        model = StockMovement
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(source="inventory_item.name", read_only=True)
    unit = serializers.CharField(source="inventory_item.unit", read_only=True)

    class Meta:
        model = PurchaseOrderLine
        fields = ["id", "inventory_item", "inventory_item_name", "unit", "quantity_ordered", "quantity_received", "unit_cost"]
        read_only_fields = ["id", "quantity_received"]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True, default="")

    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = ["id", "reference", "received_date", "created_at", "updated_at"]

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        po = PurchaseOrder.objects.create(**validated_data)
        PurchaseOrderLine.objects.bulk_create([PurchaseOrderLine(purchase_order=po, **line) for line in lines_data])
        return po

    def update(self, instance, validated_data):
        lines_data = validated_data.pop("lines", None)
        instance = super().update(instance, validated_data)
        if lines_data is not None:
            # Replaces the whole line set — the view only allows this while
            # status is Draft/Sent (see PurchaseOrderViewSet.update), before
            # any quantity_received data would be destroyed by it.
            instance.lines.all().delete()
            PurchaseOrderLine.objects.bulk_create([PurchaseOrderLine(purchase_order=instance, **line) for line in lines_data])
        return instance


class OrderSerializer(serializers.ModelSerializer):
    # Not a model field — set by the logged-in customer at checkout to consume
    # a Customer.reward_available flag; validated server-side in perform_create.
    redeem_loyalty_reward = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Order
        fields = "__all__"
        # total_value / gift_card_amount_applied / loyalty_discount_amount are
        # deliberately NOT listed here: staff still PATCH them on existing
        # orders. On *create* they're recomputed and overwritten server-side by
        # OrderViewSet.perform_create, so whatever a client posts is ignored.
        read_only_fields = ["id", "customer", "loyalty_discount_amount", "created_at", "updated_at"]


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


class PublicFeedbackSerializer(serializers.ModelSerializer):
    """Subset of Feedback exposed to the public testimonials section —
    deliberately excludes email (staff-only PII)."""

    class Meta:
        model = Feedback
        fields = ["id", "customer_name", "rating", "message", "dessert_name", "created_at"]


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True, default="")

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
