# Rosaville bakery ecosystem

`rosaville-front-last/` (public site) and `rosaville-admin-dashboard/` (shop owner dashboard) are two halves of the same product, both served by `rosaville-backend/` (a shared Django + Django REST Framework API + PostgreSQL database). The shop owner manages the business from the dashboard; customers see the results on the live site. Three goals apply, in sequence.

## Goal 1: platform independence — DONE (locally)

Both apps have been migrated off Base44 and Manus onto a self-hosted stack:

- **`rosaville-backend/`** (new) — Django project with four apps: `accounts` (custom email-login `User` model with `role` = admin/manager/employee, JWT auth via `djangorestframework-simplejwt`, role-based permission classes in `accounts/permissions.py`), `catalog` (`Dessert` model — see Goal 2 note below — plus the local-disk upload endpoint at `/api/upload/`), `operations` (`Customer`, `Order`, `InventoryItem`, `Task`, `Feedback`), `storefront` (`ContactRequest`, `CustomCakeOrder`, `TeamMember`). All REST endpoints live under `/api/`, permissioned to mirror the RLS rules the old Base44 entities used to enforce (see `accounts/permissions.py` for the exact role/ownership logic). Local dev: PostgreSQL via Homebrew (`brew services start postgresql@16`), venv at `rosaville-backend/.venv`, `python manage.py runserver`.
- **`rosaville-admin-dashboard/`** — no more `@base44/sdk`; talks to the Django API via `src/lib/api.js` (a plain fetch wrapper with JWT bearer auth + auto-refresh). `AuthContext.jsx` now does real email/password login against `/api/auth/*`. Auth is intentionally minimal — no Google OAuth, no self-registration/OTP; new staff accounts are created from the Employees page (admin-only), which returns a generated temp password to hand off manually (no email delivery is configured).
- **`rosaville-front-last/`** — `server/`, `drizzle/`, and `shared/` are gone entirely; it's now a pure Vite-built SPA like the dashboard, calling the same Django API via `client/src/lib/api.ts`. Its Manus-specific code (OAuth stack, LLM/image-gen/voice/maps/data-api integrations, the debug-collector Vite plugin) is deleted — none of it had a live caller. The one thing that was actually load-bearing, the `/manus-storage` image proxy, is replaced: dessert/menu images now come from the `Dessert` model's `featured_image` (served from Django's local `MEDIA_ROOT`), and pages that still show hardcoded product mockups (Gallery, ProductDetail, SpecialDessert, About) use a local `/placeholder-dessert.svg` instead of external Manus-hosted URLs.

Verified locally end-to-end: JWT login, role-gated CRUD (admin/manager/employee + `Task` assignee-ownership), public form submissions (contact, custom cake orders), CORS between both Vite dev origins and the Django API, and no remaining `base44`/`manus` references in either app's source (one harmless exception: a vendored `media.base44.com` hostname check in `admin-dashboard/src/components/ui/image.jsx` that's never triggered by our own data).

## Goal 2: connect the two apps

Sharing one Django backend already closes part of this gap — `Dessert` is a **single model** in `catalog/models.py` (unifying the old Base44 `Dessert` entity and front-last's old `menuItems` table) that the dashboard manages and the public site's `Menu`/`MenuItem` pages read from live via `GET /api/desserts/`. Likewise `ContactRequest` unifies the old `ContactRequest` entity and `contactMessages` table.

Still separate, not yet reconciled:

| Concept | Dashboard-side | Public-site-side |
| --- | --- | --- |
| Orders | `operations.Order` (general sales/production orders, staff-managed) | `storefront.CustomCakeOrder` (custom-cake request form only) — no general checkout/order flow exists on the site; Cart/Checkout are still pure client-side state with no backend persistence |
| Customers | `operations.Customer` (CRM-style, staff-managed) | no equivalent — the site has no customer accounts |
| Team | dashboard manages staff via `accounts.User` (system accounts/roles) | `storefront.TeamMember` (public bios, unrelated to system accounts) |

Whether/how to reconcile Orders and Customers with a real site checkout flow is undecided — that's a bigger feature (building order persistence for the storefront) than a data-model rename, and hasn't been scoped yet.

## Goal 3: publish

- Public site (`rosaville-front-last`) gets a proper custom domain.
- Admin dashboard (`rosaville-admin-dashboard`) stays on Vercel's free tier — low-traffic internal tool, no custom domain needed. Both are static Vite builds, which Vercel serves natively.
- `rosaville-backend` (Django + Postgres) does **not** fit Vercel's model — it needs a real host for a stateful DB-backed app (e.g. Railway, Render, Fly.io, or a VPS). Not decided yet.
- All API calls must be HTTPS in any non-local environment (`CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` in `rosaville-backend/config/settings.py` are env-driven for this reason). Local dev stays on plain HTTP.
- The Postgres database was deliberately kept "plain" (no Postgres-only ORM features beyond `JSONField`) so it can be pointed at Supabase or another managed Postgres host later via `DATABASE_URL`, with no code changes.
- Longer-term, explicitly requested direction: the two frontends' tech stacks should drift closer together over time (React version, build tooling, UI kit) rather than staying independently divergent — not started yet.
- **No payment processor, by deliberate choice** — orders are created `Unpaid` by default with no real charge step (no Stripe/etc. integration). This is not a gap to close before publishing; the owner has chosen to launch with order collection only (no live transactions) for now. Don't treat "add payment processing" as implied scope on any publish/launch task unless explicitly asked.
- **Test/dev data currently in the database, kept intentionally** — customers, orders, feedback, etc. accumulated during development. The owner has chosen to leave it for now rather than clean it up immediately (manual delete UI exists across the dashboard — Customers, Orders, Feedback, Newsletter, Gift Cards, Purchase Orders, Special of the Month — so they can remove it themselves whenever ready). Don't list this as an error/blocker in readiness checks; a neutral "still present, clean up whenever ready" mention is fine if relevant.
- **External services still to connect before publishing**: Brevo (`BREVO_API_KEY`/`BREVO_LIST_ID` — newsletter sync) and Brevo's SMTP relay or another SMTP provider (`EMAIL_HOST`/`EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD` — password-reset and staff temp-password emails, currently only print to the console locally), Supabase Postgres (`DATABASE_URL`), Supabase S3-compatible storage (`SUPABASE_S3_*` — without this, uploads don't survive a redeploy). All four are coded and ready, just waiting on real credentials.
