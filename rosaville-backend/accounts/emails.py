import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _send(subject, message, to_email):
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=False)
    except Exception:
        # Best-effort: a broken SMTP config shouldn't 500 the request that
        # triggered the email (registration/reset-request/staff-creation all
        # still succeed locally either way).
        logger.exception("Failed to send email to %s", to_email)


def send_password_reset_email(user, reset_url):
    _send(
        "Reset your Rosaville password",
        f"Hi{' ' + user.full_name if user.full_name else ''},\n\n"
        f"Someone requested a password reset for this account. If that was you, "
        f"set a new password here:\n\n{reset_url}\n\n"
        f"This link works once. If you didn't request this, you can ignore this email.",
        user.email,
    )


def send_temp_password_email(user, temp_password):
    _send(
        "Your Rosaville staff account",
        f"Hi{' ' + user.full_name if user.full_name else ''},\n\n"
        f"An account has been created for you on Rosaville's admin dashboard.\n\n"
        f"Email: {user.email}\nTemporary password: {temp_password}\n\n"
        f"Log in at {settings.DASHBOARD_URL}/login and change your password from Settings.",
        user.email,
    )
