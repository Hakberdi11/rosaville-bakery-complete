"""Django settings for the shared Rosaville backend (serves both the public
site and the admin dashboard over a REST API)."""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-dev-key-change-me")

DEBUG = os.environ.get("DJANGO_DEBUG", "false").lower() == "true"

ALLOWED_HOSTS = [h.strip() for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "accounts",
    "catalog",
    "operations",
    "storefront",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database — plain PostgreSQL via a DATABASE_URL-style env var, so this can
# be pointed at Supabase or any other managed Postgres host later with no
# code changes, just a different connection string.
def _database_config():
    url = os.environ.get("DATABASE_URL")
    if url:
        import urllib.parse as up

        parsed = up.urlparse(url)
        query = up.parse_qs(parsed.query)
        sslmode = query.get("sslmode", ["require"])[0]
        # urlparse does NOT percent-decode .username/.password — a password
        # with special characters (recommended, and what Supabase generates)
        # would otherwise be sent to Postgres still percent-encoded and fail
        # auth. Explicitly unquote both.
        return {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path.lstrip("/"),
            "USER": up.unquote(parsed.username) if parsed.username else "",
            "PASSWORD": up.unquote(parsed.password) if parsed.password else "",
            "HOST": parsed.hostname or "localhost",
            "PORT": parsed.port or 5432,
            "OPTIONS": {"sslmode": sslmode},
        }
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "rosaville"),
        "USER": os.environ.get("DB_USER", ""),
        "PASSWORD": os.environ.get("DB_PASSWORD", ""),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }


DATABASES = {"default": _database_config()}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Brevo (ex-Sendinblue) newsletter sync. Leave BREVO_API_KEY unset to skip
# syncing entirely — subscribers still get saved locally either way.
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
BREVO_LIST_ID = os.environ.get("BREVO_LIST_ID")

# Transactional email (password resets, staff temp-password delivery). With no
# EMAIL_HOST set, mail is printed to the runserver console instead of sent —
# safe local-dev default, nothing to configure to see emails while developing.
# In production set EMAIL_HOST (Brevo's SMTP relay works with the same
# account as BREVO_API_KEY above — smtp-relay.brevo.com:587 — or any SMTP
# provider) plus EMAIL_HOST_USER/EMAIL_HOST_PASSWORD.
EMAIL_HOST = os.environ.get("EMAIL_HOST")
if EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "true").lower() == "true"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@rosaville.local")

# Base URLs of the two frontends, used to build links in outgoing emails
# (password reset links) — customers get a FRONTEND_URL link, staff get a
# DASHBOARD_URL link, since password-reset is one shared backend feature
# serving both apps' distinct login pages.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
DASHBOARD_URL = os.environ.get("DASHBOARD_URL", "http://localhost:5174")

# Media storage defaults to local disk (fine for local dev). Setting
# SUPABASE_S3_BUCKET switches uploads to Supabase's S3-compatible object
# storage instead — required in production, since local disk on most hosts
# (Railway included) doesn't survive a redeploy.
SUPABASE_S3_BUCKET = os.environ.get("SUPABASE_S3_BUCKET")
if SUPABASE_S3_BUCKET:
    STORAGES["default"] = {"BACKEND": "storages.backends.s3boto3.S3Boto3Storage"}
    AWS_STORAGE_BUCKET_NAME = SUPABASE_S3_BUCKET
    AWS_S3_ENDPOINT_URL = os.environ.get("SUPABASE_S3_ENDPOINT")
    AWS_ACCESS_KEY_ID = os.environ.get("SUPABASE_S3_ACCESS_KEY")
    AWS_SECRET_ACCESS_KEY = os.environ.get("SUPABASE_S3_SECRET_KEY")
    AWS_S3_REGION_NAME = os.environ.get("SUPABASE_S3_REGION", "us-east-1")
    AWS_S3_ADDRESSING_STYLE = "path"
    AWS_DEFAULT_ACL = "public-read"
    AWS_QUERYSTRING_AUTH = False
    # Supabase's S3-compatible API endpoint (SUPABASE_S3_ENDPOINT, used above
    # for the actual upload) requires signed requests — a plain GET against
    # it 403s. Supabase serves public reads from a *different* URL shape,
    # .../storage/v1/object/public/<bucket>/<key>, on the project's main
    # domain rather than the S3 endpoint's host. Point django-storages'
    # generated .url() there instead, via SUPABASE_URL (the project's base
    # URL, e.g. https://<project-ref>.supabase.co — shown on the project
    # dashboard, distinct from SUPABASE_S3_ENDPOINT).
    supabase_url = os.environ.get("SUPABASE_URL", "").strip()
    if supabase_url:
        supabase_host = supabase_url.replace("https://", "").replace("http://", "").rstrip("/")
        AWS_S3_CUSTOM_DOMAIN = f"{supabase_host}/storage/v1/object/public/{SUPABASE_S3_BUCKET}"
else:
    STORAGES["default"] = {"BACKEND": "django.core.files.storage.FileSystemStorage"}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# REST Framework / JWT

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 100,
    # DRF renders DecimalField as a JSON string by default (to preserve precision).
    # Both frontends treat price/total/cost fields as numbers (.toFixed(), arithmetic),
    # matching what the old Base44 API returned — coerce to numbers to match that contract.
    "COERCE_DECIMAL_TO_STRING": False,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "USER_ID_FIELD": "id",
}


# CORS — both React dev servers (front-last public site, admin-dashboard) run
# on separate origins from the Django API, so every allowed frontend origin
# must be listed explicitly. All non-local origins must be https://.
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174",
    ).split(",")
    if o.strip()
]
CSRF_TRUSTED_ORIGINS = [o for o in CORS_ALLOWED_ORIGINS if o.startswith("https://")]
