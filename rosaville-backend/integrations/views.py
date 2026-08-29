import logging

from django.conf import settings
from django.core import signing
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOnly, IsStaff

from . import meta, tiktok
from .models import SocialAccount
from .serializers import SocialAccountSerializer

logger = logging.getLogger(__name__)

STATE_SALT = "integrations.social-oauth-state"
STATE_MAX_AGE = 600  # 10 minutes — plenty for a user to complete a consent screen

PLATFORM_MODULES = {
    SocialAccount.Platform.INSTAGRAM: meta,
    SocialAccount.Platform.FACEBOOK: meta,
    SocialAccount.Platform.TIKTOK: tiktok,
}


def _not_configured(platform):
    if platform in (SocialAccount.Platform.INSTAGRAM, SocialAccount.Platform.FACEBOOK):
        return not (settings.META_APP_ID and settings.META_APP_SECRET)
    if platform == SocialAccount.Platform.TIKTOK:
        return not (settings.TIKTOK_CLIENT_KEY and settings.TIKTOK_CLIENT_SECRET)
    return True


class AccountsListView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        accounts = SocialAccount.objects.all()
        return Response(SocialAccountSerializer(accounts, many=True).data)


class ConnectView(APIView):
    """Returns the provider's OAuth consent URL for the frontend to redirect
    the whole page to (not an XHR-followed redirect — the provider's login
    screen can't run inside a fetch)."""

    permission_classes = [IsAdminOnly]

    def post(self, request, platform):
        if platform not in SocialAccount.Platform.values:
            return Response({"detail": "Unknown platform."}, status=404)
        if _not_configured(platform):
            return Response(
                {"detail": f"{platform.capitalize()} isn't configured on the server yet. Add its API credentials first."},
                status=400,
            )

        state = signing.dumps({"user_id": request.user.id, "platform": platform}, salt=STATE_SALT)
        module = PLATFORM_MODULES[platform]
        authorize_url = module.get_authorize_url(state)
        return Response({"authorize_url": authorize_url})


class CallbackView(APIView):
    """The provider redirects the browser here directly — no Authorization
    header is possible, so the signed `state` param (created in ConnectView)
    both authenticates the request and carries which platform/user initiated
    it. Always redirects back to the dashboard (success or error) rather than
    returning JSON, since this is a full-page navigation, not an API call."""

    permission_classes = [AllowAny]

    def get(self, request, platform):
        error_redirect = f"{settings.DASHBOARD_URL}/social-media?error=1"
        code = request.GET.get("code")
        state = request.GET.get("state")
        if not code or not state:
            return redirect(error_redirect)

        try:
            payload = signing.loads(state, salt=STATE_SALT, max_age=STATE_MAX_AGE)
        except signing.BadSignature:
            logger.warning("Rejected social OAuth callback with invalid state signature")
            return redirect(error_redirect)

        if payload.get("platform") != platform:
            return redirect(error_redirect)

        try:
            if platform == SocialAccount.Platform.TIKTOK:
                data = tiktok.resolve_connection(code)
            else:
                data = meta.resolve_connection(code, platform)
        except (meta.MetaAPIError, tiktok.TikTokAPIError) as exc:
            logger.warning("Social OAuth connect failed for %s: %s", platform, exc)
            return redirect(error_redirect)

        SocialAccount.objects.update_or_create(
            platform=platform,
            defaults={
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token", ""),
                "account_id": data["account_id"],
                "account_name": data.get("account_name", ""),
                "connected_by_id": payload.get("user_id"),
            },
        )
        return redirect(f"{settings.DASHBOARD_URL}/social-media?connected={platform}")


class DisconnectView(APIView):
    permission_classes = [IsAdminOnly]

    def post(self, request, platform):
        SocialAccount.objects.filter(platform=platform).delete()
        return Response(status=204)


class AnalyticsView(APIView):
    permission_classes = [IsStaff]

    def get(self, request, platform):
        try:
            account = SocialAccount.objects.get(platform=platform)
        except SocialAccount.DoesNotExist:
            return Response({"detail": "Not connected."}, status=404)

        module = PLATFORM_MODULES[platform]
        try:
            data = module.fetch_analytics(account)
        except (meta.MetaAPIError, tiktok.TikTokAPIError) as exc:
            logger.warning("Failed to fetch %s analytics: %s", platform, exc)
            return Response({"detail": str(exc)}, status=502)

        return Response(data)
