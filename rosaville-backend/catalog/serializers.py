from rest_framework import serializers

from .models import Dessert, SpecialOfMonth


class DessertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dessert
        fields = [
            "id", "name", "category", "description", "price",
            "featured_image", "images", "ingredients", "sizes", "allergens", "tags",
            "preparation_time", "availability", "featured", "seasonal", "display_order",
            "in_gallery", "labor_hours", "batch_yield", "packaging_cost", "target_margin_percent",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SpecialOfMonthSerializer(serializers.ModelSerializer):
    dessert_detail = DessertSerializer(source="dessert", read_only=True)
    display_title = serializers.SerializerMethodField()
    display_story = serializers.SerializerMethodField()

    class Meta:
        model = SpecialOfMonth
        fields = [
            "id", "dessert", "dessert_detail", "month_label", "title", "story",
            "display_title", "display_story", "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_display_title(self, obj):
        return obj.title or obj.dessert.name

    def get_display_story(self, obj):
        return obj.story or obj.dessert.description
