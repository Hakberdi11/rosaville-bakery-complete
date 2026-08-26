import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts"


def sync_subscriber(email: str) -> None:
    """Best-effort push of a new newsletter subscriber to Brevo. Never raises —
    a Brevo outage or missing API key must not block signup; the
    NewsletterSubscriber row in our own DB is the source of truth either way."""
    if not settings.BREVO_API_KEY:
        return

    payload = {"email": email, "updateEnabled": True}
    if settings.BREVO_LIST_ID:
        payload["listIds"] = [int(settings.BREVO_LIST_ID)]

    try:
        requests.post(
            BREVO_CONTACTS_URL,
            json=payload,
            headers={
                "api-key": settings.BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=5,
        )
    except requests.RequestException:
        logger.exception("Failed to sync newsletter subscriber %s to Brevo", email)
