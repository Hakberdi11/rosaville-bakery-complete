# Bakery Pricing Systems Research

_Generated: 2026-08-13_

This is the systems/software layer — how pricing gets automated once an operation outgrows one person doing cost-plus math by hand. See `.claude/research/bakery-pricing-research.md` for the underlying manual formula; this file doesn't repeat that ground.

## Systems reviewed

| System | What it is | Realistically for |
|---|---|---|
| **Square** | General-purpose POS, $0–$149/mo software tiers | Single-location cafés/bakeries/food trucks wanting simple setup, no long contract |
| **Toast** | Restaurant-focused POS, $0–$503/mo, 1–3 yr hardware contracts, AI benchmarking as paid add-on | Full-service restaurants more than bakeries; contract overhead usually not worth it for a single bakery |
| **Lightspeed** | iPad-based POS, $189–$399/mo, strong analytics/inventory | Multi-concept or multi-location retail/restaurant operations |
| **Apicbase** | F&B management platform: recipe costing, inventory, procurement, menu engineering | Multi-site restaurant/catering groups — genuinely enterprise-tier |
| **MarketMan** | Cloud inventory + procurement platform with built-in recipe costing | Mid-size foodservice operations with real supplier-ordering volume |
| **Restaurant365** | Combined accounting + inventory + scheduling + payroll + POS integration ERP | Multi-unit restaurant/bakery groups needing unified financials, not single shops |
| **FlexiBake / CS Manufacturing / JustFoodERP** | Wholesale/manufacturing-grade bakery ERPs (batch tracking, production planning) | Wholesale/manufacturing bakeries producing at scale for distribution, not a single retail storefront |
| **BakeSmart** | All-in-one bakery platform: POS, custom cake "Cake Matrix Pricing Engine," wholesale order mgmt, online store | Small-to-mid bakeries doing meaningful custom cake volume; $99–$119/mo base, scales by station/location |
| **CakeBoss** | Home/small-bakery order entry, recipe costing, invoicing | Home and small bakeries; $149 first year then $20/year — closest in size class to Rosaville |
| **Craftybase (Stocksmith)** | Recipe/inventory costing tool for makers, weighted-average ingredient costing | Small maker/bakery businesses wanting automatic COGS without enterprise ERP overhead |
| **Restaurant365 / Zilliant / Pricemoov / Revionics / Omnia Retail** | Dedicated dynamic-pricing engines (ML + rule-based guardrails) for retail/restaurant chains | Multi-location chains and franchises only — genuinely not applicable to a single shop |

## How pricing gets automated

The key architectural finding: **there are two distinct tiers of automation, and the split lines up almost exactly with business size.**

1. **Cost recalculation is automated even in small tools; the *price* itself is not auto-applied anywhere reviewed.**
   - Craftybase/Stocksmith: recording a new ingredient purchase at a different price automatically recalculates that ingredient's weighted-average unit cost, and every recipe using it updates its cost immediately — no manual reopening of each recipe.
   - Apicbase (enterprise tier): supplier price changes propagate automatically into every recipe costing in real time via supplier integrations — described explicitly as "no manual recalculation, no stale costings."
   - In both cases, what's automated is the **cost side** (ingredient cost → recipe cost → margin %), not the **price side**. No system reviewed auto-changes the customer-facing sale price without a human step — that step is always either a notification/alert or a suggested price a manager confirms.

2. **True dynamic pricing engines (Restaurant365, Zilliant, Pricemoov, Revionics, Omnia Retail) do continuously recompute and can auto-apply prices**, using demand, inventory, competitor price, time-of-day, and customer-segment signals — but these are chain/franchise-scale platforms, not something a bakery-specific tool offers, and go well beyond ingredient-cost-linked pricing into full retail dynamic pricing.

**Bottom line:** live-linked *cost* data (ingredient cost → recomputed margin) is standard even in small tools and cheap to replicate. Live-linked *price* auto-application is enterprise/chain-only territory and not something real bakery-scale tools do even when the cost side is automated — the human is always the one who moves the sale price.

## Rule-based / tiered pricing patterns

- **By channel (retail vs. wholesale)**: extremely common pattern. Wholesale is typically priced at 40–50% off retail (wholesale price ≈ 50–60% of retail price). Bakery software (e.g. Cybake, BakeSmart) supports the same product carrying a different price per channel — wholesale accounts, online store, in-person retail — configured per customer/account type rather than computed dynamically.
- **By product category**: a recurring pattern across every source, both manual-formula and systems-level — everyday/high-volume items (cupcakes, muffins, basic cookies) are priced thin and volume-driven, while custom/decorated/wedding work carries deliberately higher margins (60–80% cited for wedding cakes) because the value is skill/labor, not ingredient cost. Systems like BakeSmart formalize this with a dedicated custom-cake pricing engine (the "Cake Matrix") separate from standard SKU pricing — architecturally, custom/build-your-own items get a rules-based calculator (size × tiers × add-ons), while everyday items get a flat catalog price.
- **Margin floors as a hard rule**: dynamic-pricing-engine documentation (Sparkling Logic, Restaurant365) describes explicit guardrails — minimum margin, price floors, maximum daily fluctuation caps — hard-coded so the engine cannot compute a price below cost or below a minimum acceptable margin. At the small-bakery-tool tier, no dedicated "floor" mechanism was found separate from the cost calculation itself — the stated purpose of tools like CakeBoss/BakeProfit is precisely to compute the true cost so the owner doesn't undercut it; the "floor" is implicit in showing the honest cost number, not an enforced software rule.

## Automation vs human override in practice

Consistent pattern across every tier reviewed:

- **Small/mid bakery tools** (Craftybase, CakeBoss, BakeProfit, BakeMargin): fully automate cost calculation and margin math, but present the result as a **suggested price** the owner reviews — none auto-writes the new price to a menu or POS listing.
- **Mid-tier F&B ERPs** (Apicbase, MarketMan): automate cost propagation and actively **alert/notify** staff when a margin drops below a predefined threshold ("your team receive a notification when a dish's margin drops below your predefined threshold") — this is an alert-to-human pattern, not silent auto-repricing.
- **Enterprise dynamic-pricing engines** (Restaurant365-class, Zilliant, Pricemoov, Revionics): the only tier where price is described as being **auto-applied within guardrails** rather than merely suggested — and even there, guardrails (floors/ceilings/max daily change) exist specifically because full automation is trusted only inside hard-coded bounds, not unconditionally.
- No system at any tier reviewed described bypassing human review for a price *increase or decrease outside pre-approved bounds* — the trust boundary is consistently "compute and surface, human confirms" except inside narrow, pre-approved guardrail bands at the largest chain scale.

## Margin governance patterns

- **Default + override**: the common shape is a store-wide or category-wide target margin (e.g., "aim for 30–50%"), with individual recipes/items able to override that default — mirrors the manual-formula research's finding that margin% is "the one deliberately owner-editable lever."
- **Drift alerts**: Apicbase's margin-threshold notification (alert when a dish's margin drops below a predefined %, triggered by ingredient cost changes) is the clearest concrete pattern found for automated margin governance — it's an alert mechanism, not an auto-correction mechanism.
- **Menu engineering dashboards**: Apicbase and similar tools combine POS sales data with recipe-level margin to classify items (popular+profitable vs. popular+margin-poor vs. neither), updating as a live "margin matrix" rather than a quarterly spreadsheet exercise — this is a monitoring/governance layer on top of the cost data, distinct from the pricing calculation itself.
- **Approval workflows**: found in the finance/AP context (Restaurant365 flags price variances against purchase orders before invoices are paid) rather than in a dedicated "approve this new menu price" workflow — no bakery-specific tool reviewed had a formal multi-step price-change approval flow; that pattern belongs to enterprise dynamic-pricing platforms' guardrail configuration, not bakery software specifically.

## Small-bakery-realistic vs. enterprise-only

**Realistic to bring to a single-location dashboard:**
- Auto-recalculating recipe/item cost when an ingredient's stored unit cost changes (the Craftybase pattern) — this only requires ingredient costs living in a shared table that recipes reference, which the existing cost-plus-formula research already assumes.
- Surfacing a **suggested price** (via the existing margin/markup formula) next to the current listed price, flagged when they diverge — not auto-changing the listed price.
- A simple **margin-threshold alert**: notify/badge when an item's live margin (current price vs. current computed cost) drops below a configured target — this is the single highest-value, most replicable pattern found; it requires no ML and no dynamic-pricing infrastructure, just a comparison and a UI badge.
- **Category-level default margin/markup** with per-item override — small config surface, matches how every tool in this research (both manual and systems tier) actually structures the "editable lever."
- **Channel price fields** (retail vs. wholesale price per item) if/when Rosaville ever sells wholesale — low-complexity, same underlying cost/margin math, just a second price column.
- A **custom-order pricing calculator** (BakeSmart's "Cake Matrix" pattern: size × add-ons × tier) for custom cake orders specifically, since custom/wedding work is confirmed as the highest-margin, most rules-driven category across every source — this is a good match for Rosaville's `storefront.CustomCakeOrder` model.

**Genuinely enterprise/franchise-only, not worth replicating:**
- Full dynamic pricing engines (Zilliant, Pricemoov, Revionics, Omnia Retail) — demand/competitor/time-of-day signal ingestion, ML-driven price optimization, multi-location price synchronization. No single-location bakery source in this research described using or needing this tier.
- Multi-location price governance / franchise-wide guardrail configuration (max daily fluctuation, cross-location price parity rules) — meaningless with one location.
- Automatic price auto-application without human confirmation — every tier below "enterprise dynamic pricing" treats the human as the final approver, and that's the appropriate trust level for a single shop owner too; there's no evidence any bakery-scale operation benefits from skipping that step.
- Supplier EDI/procurement integrations that auto-feed live supplier cost APIs (Apicbase-style) — valuable at multi-site scale where suppliers push price files, but for a single shop, manually updating an ingredient's unit cost when a supplier changes it is not a meaningful burden, and building supplier-API integration would be effort disproportionate to the benefit.

## Sources

- [Square vs Toast vs Lightspeed: Which POS is Best for ...](https://www.expertmarket.com/pos/square-vs-toast-vs-lightspeed)
- [Toast Pricing Guide | Merchant Maverick](https://www.merchantmaverick.com/toast-pricing-guide/)
- [Toast vs. Square: Honest POS Comparison, Pricing & Features | UpMenu](https://www.upmenu.com/blog/toast-vs-square/)
- [Toast vs. Lightspeed: Honest POS Comparison, Pricing & Features | UpMenu](https://www.upmenu.com/blog/toast-vs-lightspeed/)
- [Top 10 Best Recipe Costing Software of 2026 | ZipDo](https://zipdo.co/best/recipe-costing-software/)
- [Top 10 Best Bakery Costing Software of 2026 | ZipDo](https://zipdo.co/best/bakery-costing-software/)
- [6 Recipe Cost Software Picks That Protect Restaurant Margins | Paytronix](https://www.paytronix.com/blog/recipe-cost-software)
- [A Buyer's Guide to Restaurant Food Cost Software (2026) | Orbisk](https://orbisk.com/blog/restaurant-food-cost-software/)
- [Food Cost Control: How Multi-Site Restaurants Reduce food cost | Apicbase](https://get.apicbase.com/reduce-food-cost/)
- [Food Cost Control for Multi-Site Restaurants | Apicbase](https://get.apicbase.com/food-cost-control/)
- [Menu Engineering: A Proven Strategy to Increase Restaurant Profits | Apicbase](https://get.apicbase.com/restaurant-menu-engineering/)
- [Restaurant Menu Costing — How to Automate Recipe Calculations & Eliminate Low-Margin Items | Apicbase](https://get.apicbase.com/restaurant-menu-costing/)
- [Food Costing Software | Apicbase](https://get.apicbase.com/food-costing-software/)
- [6 Best Dynamic Pricing Software Solutions (2026) | Shopify](https://www.shopify.com/blog/dynamic-pricing-software)
- [Dynamic Pricing Models: Rule-Based vs AI Pricing Systems | 42signals](https://www.42signals.com/blog/dynamic-pricing-models-ecommerce/)
- [Enterprise Dynamic Pricing Platforms Compared: Features, Costs, Integration | Restaurant365](https://www.restaurant365.com/blog/enterprise-dynamic-pricing-platforms-compared-features-costs-integration/)
- [Dynamic Pricing Engines in Retail | Sparkling Logic](https://www.sparklinglogic.com/dynamic-pricing-engines-in-retail/)
- [Restaurant Pricing Strategy: The Complete Guide (2026) | Menuspy](https://menuspy.ai/guides/restaurant-pricing-strategy/)
- [Wholesale Food Pricing: The 40% Margin Rule (2026) | Find Homegrown](https://findhomegrown.com/blog/wholesale-pricing-food-products)
- [Restaurant365 Software Reviews, Demo & Pricing - 2026 | Software Advice](https://www.softwareadvice.com/accounting/restaurant365-profile/)
- [Best Practices for Restaurant Invoice Management | R365](https://www.restaurant365.com/blog/best-practices-for-restaurant-invoice-management/)
- [Restaurant AP Automation Software | Restaurant365](https://www.restaurant365.com/accounting/ap-automation/)
- [Bakery Management Software Tools to Consider | Paytronix](https://www.paytronix.com/blog/software-for-bakery-management)
- [Bakery Management Software for Small Bakeries | Craftybase](https://craftybase.com/bakery-management-software)
- [How to Price Baked Goods to Sell: A Bakery Pricing Guide | Craftybase](https://craftybase.com/blog/bakery-pricing-guide)
- [Bakery Software to Price, Schedule & Manage Orders | BakeSmart](https://bakesmart.com/)
- [Complete Bakery Management Solutions | BakeSmart Pricing](https://www.bakesmart.com/pricing)
- [Wholesale Bakery Pricing: 5 Numbers That Matter | BakingSubs](https://www.bakingsubs.com/blog/pricing-baked-goods-for-wholesale-accounts)
- [Food Costing Software | Craftybase](https://craftybase.com/c/food-costing-software)
- [Recipe Costing Software for Makers | Craftybase](https://craftybase.com/recipe-costing-software)
- [Introduction to Adjustments | Craftybase Knowledge Base](https://help.craftybase.com/article/1164-introduction-to-adjustments)
- [BakeSmart Reviews 2026 | G2](https://www.g2.com/products/bakesmart/reviews)
- [The Best Bakery Software For Success In 2025 | Toast](https://pos.toasttab.com/blog/on-the-line/bakery-software)
- [CakeBoss Reviews in 2026 | SourceForge](https://sourceforge.net/software/product/CakeBoss/)
- [bakesmart vs cakeboss | G2](https://www.g2.com/compare/bakesmart-vs-cakeboss)
