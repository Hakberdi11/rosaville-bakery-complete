---
name: rosaville-functionality-audit
description: Hands-on regression/functionality test of the Rosaville admin dashboard, public site, and shared Django API, verifying every core user-facing flow still works end-to-end after the recent production-deploy prep changes (DEBUG default flip, whitenoise, env-gated S3 storage). Actually performs each action and checks real effects, not just page loads. Use when asked for a functionality test, regression check, or "does everything still work" audit of Rosaville.
disable-model-invocation: true
---

# Rosaville functionality audit

Verify the app actually works end-to-end, the way a real user (owner, staff, or customer)
would use it — perform the action, then check a second independent signal (API response,
DB-backed page, cross-app propagation), not just "no error toast appeared."

## Reference material

- Django REST Framework testing guide — https://www.django-rest-framework.org/api-guide/testing/
  (for how to sanity-check API responses/status codes match expectations)
- MDN HTTP response status codes — https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
  (use this to judge whether a given response code is correct for the action, not guesswork)
- Playwright (Python, sync API) docs — https://playwright.dev/python/docs/intro
  (the driving tool for browser interaction, consistent with the existing
  `rosaville-owner-review` skill in this repo)

## 1. Environment setup

1. Confirm backend (`:8000`, Postgres via `brew services start postgresql@16`), admin
   dashboard (`:5174`), and public site (`:5173`) are running; start whatever isn't.
2. Login credentials: `admin@rosaville.local` / `changeme123`.
3. This audit runs **after** a deploy-prep change set (see `git log` on
   `rosaville-backend/config/settings.py`, `requirements.txt`, `Procfile`, and the new
   `vercel.json` files in both frontends) — the specific regression risk to rule out is that
   `DJANGO_DEBUG` now defaults to `false` instead of `true` (local `.env` explicitly sets
   `DJANGO_DEBUG=true` so this should be a non-issue, but confirm it), and that the
   env-gated S3 storage branch in `config/settings.py` didn't change local upload behavior
   (no `SUPABASE_S3_*` vars are set locally, so `/api/upload/` should still write to local
   disk — confirm an uploaded file actually appears under `rosaville-backend/media/`).
4. Write throwaway scripts to the scratchpad directory, not the repo.

## 2. Methodology

- Do the action, then verify independently — e.g. read `current_stock` before/after an order
  status change, hit the API directly with `requests`/`curl` + a real JWT rather than
  trusting the UI's own success toast, check the public site after a CMS edit instead of the
  dashboard's preview.
- Open the browser console (`page.on("console"/"pageerror")`) on every save/create action —
  a swallowed `catch (e) { console.error(e) }` with no user-visible error is a real bug
  (silent 400s look like dead buttons).
- Watch for type-mismatch id comparisons (`<select>` values are strings; API ids are numbers)
  in any dialog/form you touch — grep `.find((x) => x.id ===` if a dependent field stays
  blank after a selection.
- Test both desktop and a mobile viewport (390×844) for any feature gated behind
  `useIsMobile()` or hover-only controls.
- If a script action doesn't do what's expected, don't assume it's an app bug — dump the
  actual DOM/dialog text first (wrong selector / strict-mode violation from duplicate
  mobile+desktop markup is a common false lead in this codebase).

## 3. Coverage checklist

### Backend API sanity
- `python manage.py check` and `python manage.py migrate --check` both clean.
- Every list endpoint (`/api/orders/`, `/api/desserts/`, `/api/inventory/`, `/api/customers/`,
  `/api/tasks/`, etc.) returns 200 with a real JWT and 401 without one.
- `/api/upload/` accepts a real image and returns a working URL; the file lands on disk
  under `media/` and is servable back via `GET` on that URL.

### Admin dashboard (`:5174`)
- **Orders** — create an order against a real dessert, confirm total/name populate; walk a
  status through Pending → Confirmed → Cancelled → Confirmed while watching Inventory's stock
  number and Stock History for matching entries.
- **Desserts/Recipes** — create/edit a dessert, link an ingredient, confirm the
  "N ingredients" badge updates.
- **Inventory** — add an item, quick-adjust stock, confirm Stock History reflects it.
- **Suppliers/Purchase Orders** — create a PO, mark sent, receive partially then fully,
  confirm inventory and status update correctly at each step.
- **Customers/Employees/Tasks** — add a customer, invite staff (confirm a real temp password
  is generated), create and assign a task, confirm it appears on Production once tied to an
  order.
- **Website CMS/Settings** — edit CMS copy, publish, confirm it reflects on the **public
  site**, not just the dashboard preview; toggle a settings switch and confirm it survives a
  reload.

### Public site (`:5173`)
- Browse Menu → Product Detail → add to cart; navigate to Cart/Checkout via real `<Link>`
  clicks (not `page.goto()` — cart state is intentionally client-only).
- Complete a real checkout; confirm the resulting order appears correctly in the dashboard's
  Orders page with correct total/item name.
- Submit the Contact form, Custom Cake request (with an image upload), and newsletter signup
  with a fresh email.
- Confirm dessert/menu images render (validates the local-disk media path still works
  post-deploy-prep changes).

## 4. Cleanup

- Restore any `.env` changes and stop temporary servers started for this run.
- Delete scratch scripts.
- Leave real test data created (orders, desserts) unless it corrupted something.

## 5. Output

Report via `ReportFindings`, most-actionable first — group into confirmed regressions/bugs,
lower-urgency gaps, and confirmed-working flows (only list "confirmed working" items that got
non-trivial real verification, not just a page load).
