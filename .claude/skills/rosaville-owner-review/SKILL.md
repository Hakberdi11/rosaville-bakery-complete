---
name: rosaville-owner-review
description: Hands-on acceptance test of the Rosaville admin dashboard and public site, played as a paying bakery owner. Actually clicks through and performs every feature (create/edit/status-change/delete, not just page loads) across both apps, cross-checks the real effects (inventory math, cross-app propagation, API state), and reports confirmed bugs vs. real gaps vs. what genuinely works. Use when asked for an owner review, acceptance test, "does everything actually work", or a placeholder/misfunctioning-feature audit of Rosaville.
disable-model-invocation: true
---

# Rosaville owner acceptance test

You are testing this app the way a bakery owner who paid for it would: by actually using every
feature, expecting it to work, and getting angry at anything that's fake, dead, or silently
broken. This is **not** a code-reading audit — every finding must come from actually performing
the action and observing the real result (UI, API response, or DB state), not from reading source
and assuming it works.

## 1. Environment setup

1. Check whether the backend (`rosaville-backend/`, expects Postgres via
   `brew services start postgresql@16`) and both frontends (`rosaville-admin-dashboard/` on
   :5174, `rosaville-front-last/` on :5173) are already running (`curl -s -o /dev/null -w '%{http_code}'` each). Start whatever isn't.
2. Backend default port is 8000. **Before starting it, check `lsof -i :8000`** — if something
   else already owns it (this machine runs other unrelated projects), do not kill it blindly.
   Ask the user via `AskUserQuestion` whether to stop that process or run Rosaville's backend on
   an alternate port (e.g. 8001) with both frontends' `VITE_API_URL` temporarily repointed. If you
   take the alternate-port path, back up both `.env`/`.env.local` files first and restore them
   (and stop the temporary servers) at the end — never leave the repo pointed at a port the user
   didn't ask for.
3. Login credentials: `admin@rosaville.local` / `changeme123`.
4. Playwright (Python, sync API) is the tool for this. If `python3 -c "from playwright.sync_api import sync_playwright"`
   fails, find the interpreter that actually has it installed (`pip3 show playwright`, check
   `~/Library/Python/*/lib/python/site-packages`) rather than reinstalling blind — a stray venv on
   `PATH` (e.g. an activated project `.venv`) can shadow the one with Playwright already in it.
5. Write throwaway test scripts to the scratchpad directory, not the repo. Delete them when done.

## 2. How to test — the methodology that actually finds bugs

- **Do the action, then verify a second, independent signal** — not just "no console error."
  Examples that worked: read `current_stock` from the Inventory page before/after a status
  change; hit the Django REST API directly with `requests`/`curl` + a real JWT to see the raw
  field values a form actually submitted; check the public site after a CMS edit instead of
  trusting the dashboard's own success toast.
- **Watch specifically for these patterns** — they accounted for every real bug found in the last
  full pass of this app:
  - **Type-mismatch id comparisons.** A `<select>`'s `onChange` value is always a string; a JS
    object's `id` from a Django API is a number. `desserts.find(x => x.id === value)` silently
    never matches and the dependent fields (name, price, auto-fill) stay blank/zero with zero
    error. Grep for `.find((x) => x.id ===` / `===\s*value` patterns in dialog/form components
    and check whether the matching field is coerced (`String(x.id) === String(value)` is correct;
    bare `===` on a select-derived value is suspect).
  - **Silently swallowed errors.** A `catch (e) { console.error(e); }` with no `setError`/toast
    means a real 400 from the backend (e.g. a blank-string date field failing DRF's
    `DateField` validation) looks to the user like a dead button. Always open the browser console
    and check `page.on("console"/"pageerror")` output when a save/create action does nothing
    visible.
  - **Stale field names from the old Base44 migration.** Every Django model in this app uses
    `created_at`/`updated_at` (not `created_date`/`updated_date`) and `User` uses `date_joined`,
    not `created_at`. Any frontend code reading `.created_date`/`.updated_date` off an API
    response gets `undefined` — dates silently render as "—" and any sort-by-date breaks.
  - **Hardcoded/mock data presented as live** — numbers, names, or charts with no real
    `entities.*`/API call backing them (check the network tab / component source), especially on
    dashboard/analytics-style pages.
  - **Features only reachable through a non-obvious path** — hover-revealed icon buttons with no
    equivalent, or a mobile-viewport-gated (`useIsMobile()`) entry point with no desktop
    equivalent to the same feature. Confirm by testing at both a default desktop viewport and a
    mobile one (`browser.new_page(viewport={"width": 390, "height": 844})`).
- **When a script action doesn't do what you expected, don't assume it's an app bug** — dump the
  dialog's actual text/DOM first. Half of false leads are wrong button labels, `strict mode
  violation` (multiple matches — mobile+desktop duplicate markup is common here), or a hard
  `page.goto()` used where a real user would click an in-app `<Link>`/nav item (this SPA has no
  route-level persistence, so a raw navigation looks like state loss that isn't really there).
- If you accidentally mutate real data while probing a form (wrong input targeted, etc.), fix it
  back before moving on — don't leave the dev DB in a state you broke via test-script error.

## 3. Coverage checklist

### Admin dashboard (`rosaville-admin-dashboard`, :5174)

For each, perform the primary write action(s), not just a page load:

- **Home** — KPIs match reality; period selector actually filters; no placeholder charts/numbers
  without a real data source.
- **Analytics / Reports** — generate the PDF report; check every stat traces to real data (watch
  for "Unknown" line items — a report referencing a deleted/unlinked record).
- **Orders** — create a new order picking a real dessert + quantity, confirm the total and item
  name populate (this is the exact spot the type-mismatch bug lived); walk a status through
  Pending → Confirmed → Cancelled → Confirmed again while watching Inventory's stock number and
  the item's Stock History for the matching Production Use / reversal entries; test the Export
  button produces a real file; test payment/amount-paid.
- **Desserts / Recipes** — create/edit a dessert, link a real ingredient via the recipe editor,
  set a size variant, confirm the "N ingredients" badge updates.
- **Inventory** — add an item with a supplier; +/- quick-adjust; Stock History dialog shows real
  movements; Start Stock Take with a deliberate variance and confirm it's flagged and corrected;
  "Reorder Now" from a low-stock row lands you on Purchase Orders pre-filled.
- **Suppliers / Purchase Orders** — create a supplier; create a PO against it; Mark Sent; receive
  partially (confirm inventory bumps by exactly the received amount and status shows "Partially
  Received"); receive the rest (status → "Received").
- **Customers, Employees, Tasks, Production** — add a customer; invite a staff member (confirm a
  real temp password is generated); create a task and assign it to that new staff member (this is
  the exact spot the silent-date-validation bug lived — test with the due date left blank first);
  confirm it appears on the Production board once tied to a real order.
- **Gift Cards** — issue one with a real amount/recipient, confirm balance and recipient render;
  apply one to an order.
- **Custom Cake Orders / Contact Requests** — confirm real submissions from the public site (see
  below) appear here with correct status filters.
- **Gallery, Special of the Month, Team, Website CMS, Marketing, Settings** — add a team member;
  edit CMS copy and Publish, then verify it landed on the **public site** (not just the dashboard's
  own preview); toggle a Settings notification switch and confirm it persists on reload; check
  Marketing/Analytics numbers are computed, not hardcoded.
- **Notifications, Audit Logs** — confirm entries have real, correctly-ordered timestamps (this is
  where the stale `created_date` bug showed up before).

### Public site (`rosaville-front-last`, :5173)

- Browse Menu → Product Detail → add to cart via the quantity selector modal.
- Navigate to Cart and Checkout **via real nav-link clicks**, not `page.goto()` (cart state is
  intentionally in-memory only and a hard navigation will falsely look like a bug — verify with a
  real `<Link>` click first before concluding otherwise).
- Complete a real Checkout with full delivery details; confirm the resulting order shows the
  correct total and item name in the dashboard's Orders page.
- Use "Track Your Order" with the real order number + email from the checkout above.
- Submit the Contact form, the Custom Cake request form (including the image upload), and the
  newsletter signup (test with a fresh, never-used email — a repeat email correctly 400s and that
  is not a bug).
- Test Favourites at both desktop and mobile viewport widths — confirm whether every viewport has
  a real path to actually add one.
- Confirm the homepage's hero/testimonial/about content reflects real CMS data vs. hardcoded
  fallback text, and note (don't necessarily "fix") anything that's clearly placeholder copy
  (default address/phone, fabricated testimonials, etc.) still live on the site.

## 4. Cleanup

- Restore any `.env`/`.env.local` changes and stop any temporary servers started for this run.
- Delete all scratch test scripts.
- Leave real test data you created (orders, desserts, etc.) unless it corrupted something —
  this repo already tolerates dev-data debris and the user can clean it separately; don't spend
  effort on DB hygiene that wasn't asked for.

## 5. Output

Produce a report grouped by severity, most-actionable first:

- **🔴 Would make an owner angry** — confirmed bugs only (you reproduced the failure and, for
  code-level bugs, identified the root cause and file:line). State user-visible impact before the
  technical cause.
- **🟡 Real gaps, lower urgency** — things that work but are misleading, hard to reach, or
  incomplete (placeholder content still live, a feature only reachable one way, etc.).
- **🟢 Confirmed working** — call out anything that went through non-trivial real verification
  (e.g. a full order lifecycle with inventory math, not just "the page loaded").

Do not report anything you didn't personally reproduce — a suspicion from reading code alone
belongs in a caveat, not a numbered finding. Publish the final report as a Claude Artifact (it's a
shareable document, not ephemeral chat output) and give a short chat summary pointing at it.
