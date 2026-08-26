from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD


class UserSerializer(serializers.ModelSerializer):
    # Loyalty snapshot for customer-role accounts (null for staff, or a
    # customer who somehow has no linked Customer row yet).
    loyalty = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "role", "full_name",
            "business_name", "business_email", "business_phone", "business_address",
            "currency", "tagline",
            "low_stock_alerts", "new_order_alerts", "feedback_alerts",
            "max_gallery_items",
            "loyalty",
        ]
        read_only_fields = ["id", "email", "role"]

    def get_loyalty(self, obj):
        customer = getattr(obj, "customer_profile", None)
        if not customer:
            return None
        return {
            "order_count": customer.order_count,
            "loyalty_points": customer.loyalty_points,
            "reward_available": customer.reward_available,
        }

    def to_representation(self, instance):
        # phone/address aren't User columns — they live on the linked
        # Customer CRM row (see operations.Customer.phone/.address), reusing
        # the same customer_profile bridge as get_loyalty above, so a
        # customer's saved contact info stays the same record their orders
        # and loyalty points are keyed off, rather than a second copy.
        data = super().to_representation(instance)
        customer = getattr(instance, "customer_profile", None)
        data["phone"] = customer.phone if customer else ""
        data["address"] = customer.address if customer else ""
        return data

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        phone = self.initial_data.get("phone")
        address = self.initial_data.get("address")
        if (phone is not None or address is not None) and instance.role == User.Role.CUSTOMER:
            from operations.models import Customer

            customer = getattr(instance, "customer_profile", None)
            if customer is None:
                customer = Customer.objects.create(
                    name=instance.full_name or instance.email, email=instance.email, user=instance
                )
            update_fields = []
            if phone is not None:
                customer.phone = phone
                update_fields.append("phone")
            if address is not None:
                customer.address = address
                update_fields.append("address")
            if update_fields:
                customer.save(update_fields=update_fields)
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Public self-registration for customer accounts (the site's storefront
    signup form) — distinct from UserAdminSerializer's staff-only creation."""

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["email", "password", "full_name"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(role=User.Role.CUSTOMER, **validated_data)


class UserAdminSerializer(serializers.ModelSerializer):
    """Used by the Employees page: list users and change their role."""

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "date_joined"]
        read_only_fields = ["id", "email", "full_name", "date_joined"]


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
