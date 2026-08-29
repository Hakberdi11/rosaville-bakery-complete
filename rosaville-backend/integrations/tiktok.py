"""TikTok Login Kit (Display API v2). Mirrors storefront/brevo.py's style:
plain functions, module-level constants, settings pulled from django.conf,
explicit timeouts.

TikTok's v2 endpoints occasionally rename fields — if a call here 400s,
check the field/scope name against TikTok's current Login Kit docs first.
"""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize/"
TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/"
VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/"

# user.info.basic: display name, avatar, follower count. video.list: recent
# videos with real view/like/comment/share counts for the connected account.
SCOPES = "user.info.basic,video.list"


class TikTokAPIError(Exception):
    pass


def get_authorize_url(state):
    redirect_uri = f"{settings.BACKEND_URL}/api/integrations/tiktok/callback/"
    params = {
        "client_key": settings.TIKTOK_CLIENT_KEY,
        "scope": SCOPES,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "state": state,
    }
    query = "&".join(f"{k}={requests.utils.quote(str(v))}" for k, v in params.items())
    return f"{AUTH_BASE}?{query}"


def resolve_connection(code):
    redirect_uri = f"{settings.BACKEND_URL}/api/integrations/tiktok/callback/"
    resp = requests.post(
        TOKEN_URL,
        data={
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "client_secret": settings.TIKTOK_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10,
    )
    data = resp.json()
    if "error" in data and data["error"]:
        raise TikTokAPIError(data.get("error_description") or data["error"])
    access_token = data["access_token"]
    refresh_token = data.get("refresh_token", "")
    open_id = data["open_id"]

    info_resp = requests.get(
        USER_INFO_URL,
        params={"fields": "open_id,display_name"},
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    info = info_resp.json().get("data", {}).get("user", {})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "account_id": open_id,
        "account_name": info.get("display_name", ""),
    }


def fetch_analytics(account):
    token = account.access_token
    info_resp = requests.get(
        USER_INFO_URL,
        params={"fields": "display_name,follower_count"},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    info_data = info_resp.json()
    if "error" in info_data and info_data["error"].get("code") not in (None, "ok"):
        raise TikTokAPIError(info_data["error"].get("message", "TikTok API error"))
    info = info_data.get("data", {}).get("user", {})

    video_resp = requests.post(
        VIDEO_LIST_URL,
        params={"fields": "id,title,cover_image_url,share_url,view_count,like_count,comment_count,share_count"},
        json={"max_count": 10},
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=10,
    )
    videos = video_resp.json().get("data", {}).get("videos", [])

    return {
        "follower_count": info.get("follower_count", 0),
        "posts": [
            {
                "caption": v.get("title", ""),
                "views": v.get("view_count", 0),
                "likes": v.get("like_count", 0),
                "comments": v.get("comment_count", 0),
                "shares": v.get("share_count", 0),
                "permalink": v.get("share_url"),
            }
            for v in videos
        ],
    }
