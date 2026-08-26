---
name: rosaville-efficiency-audit
description: Hands-on performance/efficiency audit of the Rosaville Django API and both React/Vite frontends — N+1 queries, missing pagination/indexes, bundle size, unnecessary re-renders, unoptimized images — measured against real running instances (query counts, response times, Lighthouse/bundle-analyzer output), not code inspection alone. Use when asked for a performance review, efficiency audit, or "is anything slow" check of Rosaville.
disable-model-invocation: true
---

# Rosaville efficiency audit

Measure, don't guess. Every finding needs a number: a query count, a response time in ms, a
bundle size in KB, a Lighthouse score — pulled from the actually-running app, not inferred
from reading source.

## Reference material

- Django QuerySet optimization — https://docs.djangoproject.com/en/stable/topics/db/optimization/
  (`select_related`/`prefetch_related`, `only()`/`defer()`, indexing guidance)
- Django DB instrumentation / `django.db.connection.queries` —
  https://docs.djangoproject.com/en/stable/faq/models/#how-can-i-see-the-raw-sql-queries-django-is-running
  (use this or `django-debug-toolbar` output to get real query counts per request)
- DRF pagination — https://www.django-rest-framework.org/api-guide/pagination/
- PostgreSQL `EXPLAIN ANALYZE` — https://www.postgresql.org/docs/current/sql-explain.html
- Vite production build guide — https://vite.dev/guide/build.html (chunk splitting, asset
  inlining thresholds, `build.rollupOptions`)
- web.dev / Lighthouse performance scoring — https://web.dev/explore/learn-core-web-vitals
  (Core Web Vitals: LCP, INP, CLS — the metrics to report, not vague "feels slow")
- React re-render profiling — https://react.dev/reference/react/memo and the React DevTools
  Profiler tab (https://react.dev/learn/react-developer-tools)

## 1. Environment setup

1. Confirm backend (`:8000`), admin dashboard (`:5174`), public site (`:5173`) are running.
2. For query-count measurement, either install `django-debug-toolbar` temporarily in the
   venv (revert afterward — don't leave it in `requirements.txt`) or wrap requests with
   `from django.db import connection, reset_queries` around a view call to count
   `len(connection.queries)` (requires `DEBUG=True`, which local dev already has).
3. For frontend bundle analysis, run `npm run build` in each frontend and inspect the
   real output size (`dist/` file sizes, Vite's own build summary output lists per-chunk
   gzip size already — no extra tooling required unless deeper analysis is wanted).
4. Write throwaway scripts/configs to the scratchpad directory, not the repo — if you
   temporarily add a dependency (e.g. debug-toolbar) to test, remove it before finishing.

## 2. Methodology

- Every finding pairs a **measurement** with a **cause**: e.g. "`GET /api/orders/?limit=200`
  issues 1 + N queries (N=order count) because `OrderSerializer` accesses
  `order.customer.name` without `select_related('customer')` — confirmed via
  `connection.queries` count before/after adding `select_related` in a scratch test."
- Check every list endpoint used by both frontends for N+1 patterns: `Order` (customer,
  items), `Dessert` (recipe/ingredients), `Task` (assignee), `PurchaseOrder` (supplier,
  line items) — these are the most likely spots given the model relationships in
  `.claude/rules/rosaville-backend.md`.
- Confirm every list endpoint that returns unbounded data is actually paginated in practice
  (hit it with no `?limit=` and see how many rows come back by default vs. total row count).
- Check for missing DB indexes on frequently-filtered/ordered fields (anything used in
  `?ordering=` from the frontends, or FK lookups) via `EXPLAIN ANALYZE` on the actual query
  Django generates (`str(queryset.query)`), looking for `Seq Scan` on a table with
  non-trivial row count.
- Frontend: run each app's production build, note total JS/CSS transfer size (gzipped) and
  whether route-level code-splitting (`React.lazy`/dynamic `import()`) is used anywhere or
  if it's one large bundle. Check Network tab (or build output) for unoptimized images
  (dessert photos served at full upload resolution with no resizing/`srcset`).
- Check for obviously wasteful client-side patterns: polling instead of on-demand fetch,
  re-fetching the full dessert/order list on every keystroke of a search box (no
  debounce), or a `useEffect` with a missing/incorrect dependency array causing repeated
  re-fetches (verify via Network tab request count during a normal interaction, not by
  reading the hook and guessing).

## 3. Coverage checklist

### Backend
- Query count on `GET /api/orders/`, `/api/desserts/`, `/api/tasks/`, `/api/purchase-orders/`
  (or equivalent) at a realistic row count (seed more rows via `seed_admin`/fixtures if the
  dev DB is too small to show N+1 effects).
- Confirm `COERCE_DECIMAL_TO_STRING`/pagination defaults (`PAGE_SIZE = 100` in
  `config/settings.py`) are appropriate — flag if any frontend call requests `limit=500`+
  routinely (seen in dashboard traffic logs) as a possible over-fetch.
- Response time (`curl -w '%{time_total}'`) on the heaviest list endpoints, cold and warm.

### Frontend (both apps)
- `npm run build` output size per app; note the single largest chunk.
- Whether images (dessert photos, team photos) are served at upload resolution or resized;
  check actual transferred byte size of a typical dessert image via Network tab.
- Lighthouse run (`npx lighthouse http://localhost:5173 --view` or Chrome DevTools
  Lighthouse panel) for both apps — report Core Web Vitals, not just the overall score.
- Any obvious redundant re-fetching on the Dashboard's Home/Analytics pages (do KPIs
  re-fetch on every render, or only on mount/period-change?).

## 4. Cleanup

- Remove any temporary profiling dependency (e.g. `django-debug-toolbar`) added for
  measurement — confirm `requirements.txt`/`INSTALLED_APPS`/`MIDDLEWARE` are back to their
  pre-audit state unless the user asks to keep it.
- Delete scratch scripts/configs.

## 5. Output

Report via `ReportFindings`, most-impactful first. Each finding states the measured cost
(query count / ms / KB / Core Web Vital score), the root cause with file:line, and the
expected improvement if fixed — do not report a "this could theoretically be slow" claim
without a number backing it.
