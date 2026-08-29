from django.conf import settings
from django.db import models


class SocialAccount(models.Model):
    """One connected social account per platform (upserted on reconnect —
    connecting a platform again replaces the previous account/tokens rather
    than creating a second row). Tokens are deliberately plain TextFields,
    never included in any serializer output — this codebase has no
    encryption-at-rest precedent to extend, and Postgres/Supabase already
    encrypts at rest at the infrastructure level; only server-side
    integrations code ever reads these columns."""

    class Platform(models.TextChoices):
        INSTAGRAM = "instagram", "Instagram"
        FACEBOOK = "facebook", "Facebook"
        TIKTOK = "tiktok", "TikTok"

    platform = models.CharField(max_length=20, choices=Platform.choices, unique=True)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, default="")
    token_expires_at = models.DateTimeField(null=True, blank=True)
    # The platform's own identifier for the connected entity — an Instagram
    # Business Account ID, a Facebook Page ID, or a TikTok open_id.
    account_id = models.CharField(max_length=255)
    account_name = models.CharField(max_length=255, blank=True, default="")
    connected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="connected_social_accounts"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["platform"]

    def __str__(self):
        return f"{self.get_platform_display()} ({self.account_name or self.account_id})"
