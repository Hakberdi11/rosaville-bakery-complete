# Rosaville bakery ecosystem

`rosaville-front-last/` (public site) and `rosaville-admin-dashboard/` (shop owner dashboard) are two halves of the same product: the shop owner manages the business from the dashboard, and customers should see the results of that on the live site. Two long-term goals apply across both apps and should shape any cross-cutting or architectural work.

## Current priority: get the apps working together locally, then publish

The immediate next step is **Goal 1 (connecting the two apps) verified locally** — not just each app functioning in isolation, but the dashboard and public site actually working together end to end on a local setup (e.g. a change made in the dashboard shows up on the site). Only once that's working locally does publishing/deploying come next. Goal 2 (platform independence) is a separate, longer-term effort — don't let it block getting the two apps working together first.

## Goal 1: connect the two apps

Today they are **fully disconnected** — different backends, different platforms, different data models for the same concepts:

| Concept | Dashboard (Base44) | Public site (Drizzle/MySQL) |
| --- | --- | --- |
| Menu items | `Dessert` entity — `rosaville-admin-dashboard/base44/entities/Dessert.jsonc` | `menuItems` table — `rosaville-front-last/drizzle/schema.ts` |
| Orders | `Order` entity | `customCakeOrders` table (custom-cake requests only; no general order flow on the site) |
| Customers | `Customer` entity | no equivalent table |
| Contact | `ContactRequest` entity | `contactMessages` table |
| Team | `Employee`-related data (dashboard-only) | `teamMembers` table |

A change the shop owner makes in the dashboard (e.g. editing a `Dessert`) does **not** propagate to the live site's `menuItems`, and vice versa. There is no shared database, API, or sync mechanism between them. Any integration work needs to reconcile this — either by having one app become the source of truth the other reads from, or by introducing a shared backend/data layer. No approach has been decided yet; don't assume one when making changes.

## Goal 2: platform independence

Both apps should eventually run without their current hosted-platform dependencies.

**Dashboard is coupled to Base44:**
- `@base44/sdk` and `@base44/vite-plugin` (`rosaville-admin-dashboard/package.json`)
- `src/api/base44Client.js` — the SDK client instance
- `src/lib/AuthContext.jsx` — auth built directly on Base44's low-level client, not a generic auth library
- `src/lib/app-params.js` — resolves app id/token/base URL from the Base44-hosted app
- `base44/entities/*.jsonc` — entity schemas and row-level-security rules are defined and enforced by Base44, not by app code
- Pages call `base44.entities.<Entity>.*` directly with no data-access abstraction layer to swap out

**Front-last is coupled to Manus:**
- `server/_core/sdk.ts`, `oauth.ts` — Manus-platform OAuth (not a third-party auth library)
- `server/_core/llm.ts`, `imageGeneration.ts`, `voiceTranscription.ts`, `map.ts`, `dataApi.ts`, `storageProxy.ts` — Manus-hosted integrations, each documented in a matching `references/*.md` file
- `vite.config.ts` — `vitePluginManusRuntime()` and the manus-debug-collector dev plugin
- Dev server host allowlist for `.manus.computer` / `.manuspre.computer` domains

Migrating either app off its platform is a substantial undertaking, not a drop-in swap — the entity/RLS model (Base44) and the OAuth/integration helpers (Manus) are load-bearing, not incidental. Treat this as a real architectural constraint when planning related work, not something to casually work around.
