# Rosaville Dashboard Gap Analysis

_Generated: 2026-08-08_
_Based on: .claude/research/bakery-crm-research.md_

## Already covered (don't re-suggest these)

Confirmed by reading `rosaville-backend/*/models.py` and the corresponding dashboard pages — these map directly to "small-bakery-realistic" items from the research and are already real, wired features (not stubs):

- **Customer profile + purchase history** — `operations.Customer` (`total_spend`, `order_count`, `average_order_value`, `last_order_date`, `segment` New/Regular/VIP/At Risk, `notes`, `tags`) surfaced in `pages/Customers.jsx` with search/filter/detail view.
- **Recipe costing tied to ingredient prices** — `Dessert.ingredients` (JSON, linked to `InventoryItem.cost_per_unit`) computes live cost/margin/margin% per dessert in `pages/Recipes.jsx`, including per-size ingredient overrides via `Dessert.sizes`. This is the single most-cited win in the research (CakeBoss "prevents undercharging") and Rosaville already has it, arguably more granular (per-size recipes) than CakeBoss's base tier.
- **Low-stock ingredient alerts** — `InventoryItem.minimum_stock` vs `current_stock` drives alert badges/counts in `pages/Inventory.jsx`, plus a "projected stock" mode that nets out active-order ingredient demand (goes beyond the research's basic ask).
- **Production-by-due-date view** — `pages/Production.jsx` has three real views (daily schedule by delivery date, batch/bake-list planner with combined ingredient shortfall check, kanban status board) driven off `Order.delivery_date` and `Order.status` — more complete than the research's "simple calendar/queue" bar.
- **Auto-scaling recipes by order quantity** — `Dessert.sizes[].multiplier` scales base ingredients per size; `Production.jsx`'s batch planner sums ingredient needs across all orders for a date.
- **Allergen tagging** — `Dessert.allergens` (JSONField) exists on the model (surfacing/bolding it on customer-facing labels is not verified but the data field itself is there).
- **Real-time sales + inventory dashboards** — `pages/Analytics.jsx`, `pages/Reports.jsx` (with monthly PDF export), and `Home.jsx` cover revenue/top-dessert/inventory-value reporting off live `Order`/`Customer`/`InventoryItem` data.
- **COGS/profitability visibility** — covered at the recipe level (margin per dessert in Recipes.jsx), though not yet rolled up into `Reports.jsx`'s monthly report (see Medium impact below).

## Recommended additions, prioritized

### High impact

1. **Custom-order deposit tracking + admin visibility for `CustomCakeOrder`** (Effort: M)
   - Why: research flags "custom/special-order intake with due-date and deposit tracking" as "the single feature category that shows up across every bakery-specific tool, big or small" (CakeBoss, CAKE POS, BakeSmart).
   - What's missing today: `storefront.CustomCakeOrder` exists (occasion, cake_size, flavor, custom_requests, `preferred_date` as a free-text string, inspiration image) but there is **no admin dashboard page for it at all** — it's absent from `Layout.jsx` nav and from `pages/*.jsx` (confirmed via repo-wide search; only `ContactRequest` submissions get a "Contact Requests" page). Custom cake requests submitted on the public site currently have no staff-facing view/status/triage flow. The model also has no `status` field (unlike `ContactRequest`), no `deposit_amount`/`deposit_paid`, and no link to `operations.Order` for production once accepted.
   - What it'd take: add `status`, `deposit_amount`, `deposit_paid`, and an optional FK to `Order` on `CustomCakeOrder`; a new `pages/CustomCakeOrders.jsx` (list + detail + "convert to Order" action) plus a nav entry; wire `preferred_date` to a real `DateField` if feasible.

2. **Loyalty/points or punch-card mechanic** (Effort: M)
   - Why: research lists this as realistic and valuable at single-location scale, "often bundled into the POS tier rather than sold separately" (Square, CAKE POS, KORONA).
   - What's missing today: confirmed via grep — no `loyalty`/`points` field anywhere in `operations.Customer` or elsewhere in the backend; the only hit in the whole admin dashboard is a hardcoded fake chart label ("Loyalty Email") in `pages/Marketing.jsx`'s mock data, not a real feature.
   - What it'd take: add `loyalty_points` (or `visits_count`) to `Customer`, a small earn/redeem rule tied to `Order.total_value` (server-side, e.g. in `Order` create/update), and a points display + manual adjust control in the existing `Customers.jsx` detail dialog. No new page needed — extends what's already there.

3. **Gift cards** (Effort: L)
   - Why: research lists gift cards as realistic and valuable even for a single-location shop, and a recurring feature across Square, Toast, CAKE POS.
   - What's missing today: no `GiftCard` model anywhere in `catalog`/`operations`/`storefront`; no purchase/redemption flow on either frontend.
   - What it'd take: new model (code, balance, issued/redeemed history), a dashboard page to issue/look up/adjust balances, and a redemption path in the `Order` create flow (`Orders.jsx`'s `CreateOrderDialog`) to apply a balance against `total_value`. This is the largest lift on this list — new model + new page + new API + order-flow integration.

### Medium impact

4. **Customer-facing order-status visibility** (Effort: M)
   - Why: research calls this "nice-to-have, low complexity to justify" but real (Bakersoft "customer portals").
   - What's missing today: `rosaville-front-last` has no customer accounts and no order-lookup page (per `.claude/rules/ecosystem.md`, Cart/Checkout only POST orders, they don't let a customer check back on status). `operations.Order` already has `status`/`payment_status`, so the data exists — there's just no read path exposed to the public site.
   - What it'd take: a public, unauthenticated "look up my order" endpoint (e.g. by `order_number` + email) and a simple status page on the front-last site. Backend-light, mostly a new public-site page.

5. **Roll COGS/margin into the monthly Reports/PDF export** (Effort: S)
   - Why: research calls out COGS/profitability reporting (Craftybase, CakeBoss pro tier) as a recurring pattern; Rosaville computes margin per-recipe already but `pages/Reports.jsx`'s monthly summary (revenue, top desserts, low stock, feedback rating) doesn't include a profitability line.
   - What's missing today: `Reports.jsx` has no `cogs`/`profit`/`margin` computation (confirmed via grep) despite `Recipes.jsx` already having the exact calculation available to reuse.
   - What it'd take: reuse the existing ingredient-cost calculation from `Recipes.jsx`/`lib/ingredientCalc.js` inside `Reports.jsx` to add a monthly gross-margin figure to the PDF/summary. Pure frontend, no schema change.

6. **Waste-reduction / demand-forecasting signal** (Effort: S/M)
   - Why: research lists this under realistic small-bakery patterns via CyBake's broader pattern, and Rosaville's own `Inventory.jsx` already has a "projected stock" mode that's 80% of the plumbing needed.
   - What's missing today: projected stock only looks at *currently active* orders, not historical sales velocity — there's no "you've been overordering flour vs. what you use" signal.
   - What it'd take: a lightweight comparison of `InventoryItem.current_stock` trend vs. historical `Order.items` consumption over recent weeks, surfaced as a simple flag on `Inventory.jsx`. Analysis-only, no new model.

### Low impact / nice-to-have

7. **Deposit/partial-payment field on general `Order`, not just custom cakes** (Effort: S)
   - Why: research's deposit-tracking pattern applies to "custom/special orders (cakes, catering)" specifically; Rosaville's `Order.payment_status` already has a `Partially Paid` enum value but no amount-paid field to back it.
   - What's missing today: `Order.PaymentStatus.PARTIALLY_PAID` exists as a choice but there's no `amount_paid` field to actually record how much of `total_value` has been collected.
   - What it'd take: one field (`amount_paid`) on `Order` + a small UI addition to `OrderDetail` in `Orders.jsx`.

8. **Batch/lot-lite tracking for perishable ingredients (expiry date only, not full traceability)** (Effort: S)
   - Why: research separates "full lot-to-label forward/backward traceability" (explicitly not recommended, see below) from simple expiration awareness, which shows up even in lightweight tools.
   - What's missing today: `InventoryItem` has no `expiry_date`/`received_date` field at all.
   - What it'd take: add an optional `expiry_date` field and a simple "expiring soon" badge next to the existing low-stock badge in `Inventory.jsx` — deliberately not a lot/batch system, just a date field.

## Explicitly not recommended

Per the research's own "hard to justify for a single-location shop" list, and confirmed nothing in the current codebase suggests Rosaville is trying to grow into these:

- **Multi-location inventory transfer logic** — Rosaville is single-location; `InventoryItem` has no location concept and shouldn't get one speculatively.
- **Delivery-route optimization for standing wholesale accounts (CyBake/FlexiBake)** — `Order.Channel` has a `Wholesale` option but no route/standing-order machinery exists or is implied elsewhere; building this out would mean paying complexity for a channel that isn't Rosaville's business model today.
- **Electronic batch records / 21 CFR Part 11 / BRCGS / GFSI compliance tooling** — manufacturing/co-packer-grade regulatory infrastructure; nothing in `InventoryItem` or `Dessert` suggests Rosaville needs recall-grade lot traceability (see #8 above for the lightweight alternative that's actually worth building).
- **Full forward/backward lot-to-label traceability** — same reasoning; overkill for a shop that bakes and sells same-day/same-week.
- **Enterprise loyalty tiers / franchise-style standardized-menu reporting** — the loyalty recommendation above (#2) is deliberately scoped to a single points/punch-card mechanic, not tiered/franchise loyalty.
- **Wholesale order channel with its own pricing/contract logic** — `Order.Channel.WHOLESALE` exists as a label but building out contract-specific pricing would only make sense if Rosaville genuinely starts selling to other retailers, which isn't indicated anywhere in the rules docs.
- **Staff scheduling tied to production-load forecasting** — research explicitly calls this ERP-tier overkill for a single small shop; a manual weekly schedule is fine, and nothing in `accounts.User`/`Task` suggests staff-scheduling is even a stated goal.
