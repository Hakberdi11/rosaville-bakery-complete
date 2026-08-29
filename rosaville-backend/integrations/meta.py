"""Instagram + Facebook, both via Meta's Graph API — one OAuth app, one
consent flow, covering both platforms (a Facebook Page and its linked
Instagram Business Account share the same access token). Mirrors
storefront/brevo.py's style: plain functions, module-level constants,
settings pulled from django.conf, explicit timeouts.

Graph API metric/field names shift between API versions more than most
platforms' — if a call here starts 400ing, check the field/metric name
against Meta's current Graph API docs for the GRAPH_API_VERSION below first.
"""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

# instagram_basic/instagram_manage_insights: read the linked IG Business
# Account's profile + media + insights. pages_show_list/pages_read_engagement:
# list the user's Pages and read Page-level insights. One scope list covers
# both the "Connect Instagram" and "Connect Facebook" buttons — which platform
# ends up stored is decided after the fact from what the callback resolves.
SCOPES = "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement"


class MetaAPIError(Exception):
    pass


def get_authorize_url(state):
    params = {
        "client_id": settings.META_APP_ID,
        "redirect_uri": f"{settings.BACKEND_URL}/api/integrations/meta/callback/",
        "state": state,
        "scope": SCOPES,
        "response_type": "code",
    }
    query = "&".join(f"{k}={requests.utils.quote(str(v))}" for k, v in params.items())
    return f"https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth?{query}"


def _get(path, **params):
    resp = requests.get(f"{GRAPH_API_BASE}/{path}", params=params, timeout=10)
    data = resp.json()
    if "error" in data:
        raise MetaAPIError(data["error"].get("message", "Meta API error"))
    return data


def resolve_connection(code, platform):
    """Exchanges the OAuth code for a long-lived token, finds the user's
    (first) Facebook Page, and — for platform="instagram" — that Page's
    linked Instagram Business Account. Returns the dict to store on
    SocialAccount: {access_token, account_id, account_name}.

    Both platforms authenticate against the Graph API using the *Page's*
    access token, not a separate per-platform token — that's how Meta's API
    actually works, not a simplification here."""

    redirect_uri = f"{settings.BACKEND_URL}/api/integrations/meta/callback/"

    short_lived = _get(
        "oauth/access_token",
        client_id=settings.META_APP_ID,
        client_secret=settings.META_APP_SECRET,
        redirect_uri=redirect_uri,
        code=code,
    )

    long_lived = _get(
        "oauth/access_token",
        grant_type="fb_exchange_token",
        client_id=settings.META_APP_ID,
        client_secret=settings.META_APP_SECRET,
        fb_exchange_token=short_lived["access_token"],
    )
    user_token = long_lived["access_token"]

    pages = _get("me/accounts", access_token=user_token).get("data", [])
    if not pages:
        raise MetaAPIError("No Facebook Page found for this account. Create/claim a Page first.")
    page = pages[0]
    page_token = page["access_token"]

    if platform == "facebook":
        page_info = _get(page["id"], fields="name,fan_count", access_token=page_token)
        return {
            "access_token": page_token,
            "account_id": page["id"],
            "account_name": page_info.get("name", page.get("name", "")),
        }

    # platform == "instagram"
    page_info = _get(page["id"], fields="instagram_business_account", access_token=page_token)
    ig_account = page_info.get("instagram_business_account")
    if not ig_account:
        raise MetaAPIError(
            "This Facebook Page has no linked Instagram Business account. "
            "Link one in Instagram's settings first, then reconnect."
        )
    ig_id = ig_account["id"]
    ig_info = _get(ig_id, fields="username", access_token=page_token)
    return {
        "access_token": page_token,
        "account_id": ig_id,
        "account_name": ig_info.get("username", ""),
    }


def fetch_analytics(account):
    """Live snapshot — follower count + recent posts with engagement. Uses
    the stored Page access token for both platforms (see resolve_connection)."""
    token = account.access_token

    if account.platform == "facebook":
        info = _get(account.account_id, fields="fan_count,name", access_token=token)
        posts = _get(
            f"{account.account_id}/posts",
            fields="message,created_time,likes.summary(true),comments.summary(true)",
            limit=10,
            access_token=token,
        ).get("data", [])
        return {
            "follower_count": info.get("fan_count", 0),
            "posts": [
                {
                    "caption": p.get("message", ""),
                    "created_at": p.get("created_time"),
                    "likes": p.get("likes", {}).get("summary", {}).get("total_count", 0),
                    "comments": p.get("comments", {}).get("summary", {}).get("total_count", 0),
                }
                for p in posts
            ],
        }

    # instagram
    info = _get(account.account_id, fields="followers_count,media_count", access_token=token)
    media = _get(
        f"{account.account_id}/media",
        fields="caption,media_type,timestamp,like_count,comments_count,permalink",
        limit=10,
        access_token=token,
    ).get("data", [])
    return {
        "follower_count": info.get("followers_count", 0),
        "posts": [
            {
                "caption": m.get("caption", ""),
                "created_at": m.get("timestamp"),
                "likes": m.get("like_count", 0),
                "comments": m.get("comments_count", 0),
                "permalink": m.get("permalink"),
            }
            for m in media
        ],
    }
