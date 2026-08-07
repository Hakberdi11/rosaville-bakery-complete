---
paths:
  - "rosaville-backend/**"
---

# rosaville-backend

The shared Django + Django REST Framework API + PostgreSQL database serving both `rosaville-front-last` (public site) and `rosaville-admin-dashboard` (shop owner dashboard). See `.claude/rules/ecosystem.md` for why this exists as one shared backend rather than two.

## Commands
Python venv lives at `rosaville-backend/.venv` (not committed). Activate it or prefix commands with `./.venv/bin/`.
- `python manage.py runserver` — dev server on `:8000`
- `python manage.py makemigrations` / `migrate` — schema changes
- `python manage.py seed_admin` — idempotent: creates the first admin user (`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` env vars, defaults in `.env.example`) and a handful of placeholder `Dessert` rows with a generated placeholder image, so the site isn't empty on a fresh local setup
- `python manage.py createsuperuser` — for ad-hoc account creation via the CLI instead
- `python manage.py test` — no tests exist yet (gap, not addressed)
- No lint/format tooling configured yet.
- PostgreSQL must be running locally before `runserver`/migrations will work: `brew services start postgresql@16` (installed via Homebrew; database name `rosaville`, see `.env`). Deliberately **not** registered to auto-start at login (per user preference — don't run `brew services start` without being asked, and stop it with `brew services stop postgresql@16` when done testing).

## Architecture
- Four Django apps, each owning a domain:
  - `accounts` — custom `User` model (email login, `role` = admin/manager/employee, `max_gallery_items` business setting), JWT auth via `djangorestframework-simplejwt`.
  - `catalog` — `Dessert` model (incl. `in_gallery`, a curated subset shown on the dashboard's Gallery page and the public site's Gallery/GalleryCarousel pages, toggled via the dashboard's "Add from Menu" picker — not auto-derived from "has a photo"); `SpecialOfMonth` (history of "dessert of the month" picks, only one `is_active=True` at a time — activating a new one deactivates the rest, see `SpecialOfMonthViewSet.perform_create`/`perform_update`); `/api/upload/` local-disk file upload endpoint (public — see below).
  - `operations` — `Customer`, `Order` (front-last's Checkout page POSTs real orders here — `channel="Website"`), `InventoryItem`, `Task`, `Feedback` — the dashboard's core CRUD surface.
  - `storefront` — `ContactRequest`, `CustomCakeOrder`, `TeamMember` (managed by the dashboard's Team page), `NewsletterSubscriber` (public create), and `SiteContent` — a **singleton** (`SiteContent.load()`, always `pk=1`) holding the public site's editable copy (hero/about/contact text, business hours, social links) and its `primary_color`/`accent_color` branding, edited via the dashboard's CMS page and publicly readable at `GET /api/site-content/` (front-last has no auth, so this can't live behind the staff-only `/api/auth/me/`).
- `/api/upload/` (`catalog.views.UploadFileView`) is deliberately `AllowAny`, not staff-only: the dashboard uses it for dessert/team photos, but the public site's Custom Cakes form also uses it for customer-submitted inspiration images. It converts `.heic`/`.heif` uploads to JPEG via `pillow-heif` before storing — browsers other than Safari can't render HEIC at all (the default iPhone photo format), so this is a real compatibility fix. Only affects new uploads; anything uploaded before this fix keeps its broken `.heic` URL until re-uploaded.
- `Dessert.featured_image` is a plain `CharField`, deliberately **not** `ImageField`/`URLField`: actual file bytes go through the separate `/api/upload/` endpoint (multipart), which returns a URL string that then gets written to this field over normal JSON. `ImageField` rejects JSON string writes (files-only) and `URLField` rejects the relative `/placeholder-dessert.svg` fallback both frontends use — this was a real bug once (dessert creation 400'd silently whenever no image was picked), fixed by switching field types. If a similar "store a URL that came from our own upload endpoint" field is added elsewhere, use `CharField`, not `ImageField`/`URLField`.
- DRF serializes `DecimalField`s as JSON strings by default; `COERCE_DECIMAL_TO_STRING = False` is set globally in `REST_FRAMEWORK` settings so `price`/`total_value`/`cost_per_unit`/etc. come back as JSON numbers, matching what both frontends' `.toFixed()`/arithmetic expect (and what the old Base44 API returned). Don't remove that setting without updating every numeric-field consumer.
- Model IDs are plain integers (Django `BigAutoField`), not the string UUIDs Base44 used — anywhere a frontend does string-only operations on an `id` (e.g. `.slice()` for a short order reference) needs `String(id)` first.
- Auth: JWT via `djangorestframework-simplejwt`, `Authorization: Bearer` header (not session/cookie auth — both frontends are separate SPA origins). Login is email/password only, no OAuth/self-registration. `accounts/views.py`'s `UserViewSet.create` is how new staff accounts get made (admin-only, generates a temp password returned once in the response — no email backend is configured to deliver it).
- Permissions: `accounts/permissions.py` has the full set of role-check classes (`IsAdminOrManager`, `IsStaff`, `IsAdminOnly`, `ReadOnlyOrIsStaff`, `CreateOnlyOrIsStaff`, `IsAdminOrManagerOrOwner`) — these are the direct replacement for what used to be Base44 per-entity RLS rules; each viewset picks the one matching its old RLS behavior. `IsAdminOrManagerOrOwner` additionally checks `Task.assigned_to_id` for non-admin/manager users.
- Every list endpoint supports DRF's `LimitOffsetPagination` (`?limit=`/`?offset=`) and `OrderingFilter` (`?ordering=field` or `?ordering=-field`) — `ordering_fields = "__all__"` on each viewset so any model field can be sorted on, matching the flexible `.list(sortField, limit)` calls the frontends make.
- Database: PostgreSQL, deliberately kept portable (see `.claude/rules/ecosystem.md` Goal 3) — connection config in `config/settings.py`'s `_database_config()` reads `DATABASE_URL` if set, else individual `DB_*` env vars.
- CORS: `django-cors-headers`, `CORS_ALLOWED_ORIGINS` env var (comma-separated), must be `https://` for any non-local origin — see `config/settings.py`.
- Media/uploads: local disk via Django's default `FileSystemStorage`, `MEDIA_ROOT`/`MEDIA_URL` in settings, served by the dev server only when `DEBUG=True` (production would need a real static/media host — not set up yet, see Goal 3 in `ecosystem.md`).
- `.env` (gitignored) holds local secrets/config; `.env.example` documents every variable. New: no `SiteContent`/`SpecialOfMonth`/`NewsletterSubscriber`-specific env vars — they use the same DB.
