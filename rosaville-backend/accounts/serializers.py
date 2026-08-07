from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "role", "full_name",
            "business_name", "business_email", "business_phone", "business_address",
            "currency", "tagline",
            "low_stock_alerts", "new_order_alerts", "feedback_alerts",
            "max_gallery_items",
        ]
        read_only_fields = ["id", "email", "role"]


class UserAdminSerializer(serializers.ModelSerializer):
    """Used by the Employees page: list users and change their role."""

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "date_joined"]
        read_only_fields = ["id", "email", "full_name", "date_joined"]
