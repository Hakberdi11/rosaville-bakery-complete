---
name: rosaville-security-audit
description: Hands-on security audit of the Rosaville backend and both frontends, structured around the OWASP Top 10 (2021) and the official Django/DRF security documentation. Actually attempts each check against the running app (unauthenticated requests, role-bypass attempts, upload-endpoint abuse, header inspection) rather than just reading source and assuming. Use when asked for a security review, pentest-lite, or vulnerability audit of Rosaville.
disable-model-invocation: true
---

# Rosaville security audit

You are performing an authorized, defensive security review of Rosaville — a bakery
ecosystem the user owns and is about to publish to production. This is legitimate security
testing of the user's own application, not testing a third party. Every finding must come
from actually issuing the request/observing the response, not from reading code and
assuming a vulnerability exists — note code-only suspicions as caveats, not findings.

## Reference material (ground every finding in one of these, cite which)

- OWASP Top 10:2021 — https://owasp.org/Top10/ (category IDs A01–A10 used below)
- Django security docs — https://docs.djangoproject.com/en/stable/topics/security/
- Django deployment checklist — https://docs.djangoproject.com/en/stable/howto/deployment/checklist/
  (also runnable directly: `python manage.py check --deploy`)
- DRF permissions — https://www.django-rest-framework.org/api-guide/permissions/
- django-rest-framework-simplejwt — https://django-rest-framework-simplejwt.readthedocs.io/
- django-cors-headers — https://github.com/adamchainz/django-cors-headers#configuration
- MDN security headers (HSTS, X-Content-Type-Options, CSP) — https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers

## 1. Environment setup

1. Confirm backend (`:8000`), admin dashboard (`:5174`), public site (`:5173`) are running —
   `curl -s -o /dev/null -w '%{http_code}'` each; start whatever isn't (see
   `rosaville-backend/README`/`.claude/rules/rosaville-backend.md` for commands).
2. Run `python manage.py check --deploy` from `rosaville-backend/` first — this is Django's
   own official production-security linter and will surface most A05 (Security
   Misconfiguration) issues immediately; treat every warning it prints as a finding to verify
   and report, not something to silently fix.
3. Get a real JWT for a low-privilege role (employee) and one for admin/manager via
   `POST /api/auth/login/` — you need both to test role-bypass (A01).
4. Write throwaway scripts (`curl`/`requests`/Python) to the scratchpad directory, not the repo.

## 2. Methodology — OWASP Top 10 walkthrough

For each category, do the concrete check, not a code read:

- **A01 Broken Access Control** — hit every staff-only endpoint (`/api/orders/`,
  `/api/customers/`, `/api/inventory/`, `/api/employees/` i.e. `/api/users/`, etc.) with no
  `Authorization` header (expect 401) and with an employee-role JWT on admin-only actions
  (e.g. creating a user, deleting another user) (expect 403). Test IDOR: as the employee
  role, try to read/modify a `Task` not assigned to them, or another customer's `Order`, and
  confirm `accounts/permissions.py`'s `IsAdminOrManagerOrOwner` actually blocks it in
  practice, not just in code. Confirm `/api/upload/`'s intentional `AllowAny` (documented in
  `.claude/rules/rosaville-backend.md`) doesn't also expose something it shouldn't (e.g. can
  an unauthenticated request read/list/delete other people's uploaded files, not just
  create new ones?).
- **A02 Cryptographic Failures** — confirm `DJANGO_SECRET_KEY` is not the checked-in dev
  default (`django-insecure-dev-key-change-me`) in whatever env you're testing; confirm
  passwords are stored hashed (`accounts.User` — check via Django admin or shell, never log
  a raw password); confirm JWT `SIGNING_KEY`/algorithm defaults are sane (simplejwt docs);
  confirm the deployed site (if already live) redirects HTTP→HTTPS and cookies/headers don't
  leak the JWT anywhere logged (browser history, referrer headers).
- **A03 Injection** — grep the backend for `.raw(`, `.extra(`, or any raw SQL string
  interpolation (should be none — confirm ORM-only). Check `catalog.UploadFileView` for
  path-traversal in filenames (try uploading a file named e.g. `../../evil.jpg` and confirm
  the saved path can't escape `MEDIA_ROOT`/the storage bucket prefix).
- **A04 Insecure Design** — `/api/upload/` and the public contact/custom-cake/newsletter
  endpoints are unauthenticated by design. Test for abuse potential: can you upload a very
  large file (any size cap?), an executable disguised with an image extension, or spam the
  newsletter/contact endpoints with no rate limit? Report what's actually exploitable, not
  just "no rate limiting exists" as a generic complaint.
- **A05 Security Misconfiguration** — cross-check `check --deploy` output against:
  `DEBUG` (must be `False` in prod — confirm the flipped default from the recent deploy-prep
  change actually holds), `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (must not be `*` or too
  broad), whether Django admin (`/admin/`) is reachable and whether that's acceptable, and
  whether HSTS/`SECURE_SSL_REDIRECT`/`SESSION_COOKIE_SECURE`/`CSRF_COOKIE_SECURE` are set for
  the production environment (`config/settings.py`).
- **A06 Vulnerable/Outdated Components** — run `pip list --outdated` / `pip-audit` (install
  if missing) against `rosaville-backend/requirements.txt`, and `npm audit` in both
  `rosaville-admin-dashboard/` and `rosaville-front-last/`. Report actual CVEs found, not just
  "dependencies exist."
- **A07 Identification & Authentication Failures** — check Django's
  `AUTH_PASSWORD_VALIDATORS` are enforced on account creation (try creating a staff user with
  a weak password via the API and confirm it's rejected); confirm JWT access/refresh token
  lifetimes and blacklist-after-rotation (`config/settings.py` `SIMPLE_JWT`) behave as
  configured by actually rotating a token and confirming the old one is rejected; check
  whether repeated failed logins are throttled at all (DRF throttle classes) — if not, note
  it as a finding, don't just assume.
- **A08 Software & Data Integrity Failures** — confirm price/total calculations
  (Orders, gift cards) are computed/validated server-side, not merely trusted from client
  JSON (try POSTing an order with a client-supplied `total` that doesn't match
  quantity × price and see if the backend recomputes or blindly accepts it).
- **A09 Security Logging & Monitoring Failures** — check whether failed auth attempts,
  permission denials, or admin actions are logged anywhere (Django's default logging config,
  `LOGGING` in settings). Likely a real gap — report it as such if confirmed absent, this is
  expected to be a finding not a false positive.
- **A10 SSRF** — confirm no endpoint fetches a server-side resource from a user-supplied URL
  (grep for `requests.get`/`urlopen` fed by request data). `/api/upload/` accepts file bytes
  directly (multipart), not a URL, which is the safe pattern — confirm that's really true.
- **Secrets hygiene** — `git log -p -- '*.env'` (should be empty/never committed);
  confirm `.env` is gitignored (already true per prior audit, re-verify); grep the whole repo
  history (`git log --all -p | grep -i` on `SECRET_KEY=`/`PASSWORD=`/`sk_live`/`AWS_SECRET`)
  for anything real that leaked into a past commit.

## 3. Cleanup

- Revert any test mutations (orders/uploads created while probing A01/A04/A08) unless
  leaving them is harmless dev debris (consistent with the owner-review skill's cleanup
  policy).
- Delete scratch scripts.

## 4. Output

Report via `ReportFindings`, most severe first. Each finding must state: the OWASP category,
exact request/response or reproduction steps, confirmed impact, and file:line for the
root cause when it's a code issue. Do not report a finding you didn't actually reproduce —
code-only suspicions go in a closing caveats paragraph, not the findings list.
