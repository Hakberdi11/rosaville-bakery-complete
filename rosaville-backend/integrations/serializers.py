from rest_framework import serializers

from .models import SocialAccount


class SocialAccountSerializer(serializers.ModelSerializer):
    """Deliberately NOT fields = "__all__" — access_token/refresh_token must
    never be serialized out, this is the one place in the codebase where
    that matters."""

    class Meta:
        model = SocialAccount
        fields = ["platform", "account_id", "account_name", "created_at", "updated_at"]
        read_only_fields = fields
