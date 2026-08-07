from rest_framework import serializers

from .models import ContactRequest, CustomCakeOrder, NewsletterSubscriber, SiteContent, TeamMember


class ContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class CustomCakeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomCakeOrder
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "created_at"]
        read_only_fields = ["id", "created_at"]


class SiteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = [
            "hero_title", "hero_subtitle", "hero_image",
            "about_title", "about_text",
            "contact_email", "contact_phone", "contact_address", "business_hours",
            "instagram_url", "facebook_url",
            "primary_color", "accent_color",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
