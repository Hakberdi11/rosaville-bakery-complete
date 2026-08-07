---
paths:
  - "rosaville-admin-dashboard/**"
---

# rosaville-admin-dashboard

The shop owner's back-office dashboard. See also `rosaville-admin-dashboard/AGENTS.md` for Base44 CLI workflow specifics (`base44 dev`, publish flow, env vars) — that file is the source of truth for local dev/publish steps, not duplicated here.

## Commands
- `npm run dev` — Vite dev server (frontend only, against the hosted Base44 backend)
- `npm run build` — production build
- `npm run lint` / `npm run lint:fix` — ESLint (flat config, ESLint 9)
- `npm run typecheck` — `tsc -p ./jsconfig.json` (JS files with `checkJs`, no real `.ts` files)
- `npm run preview` — preview the production build
- No test suite/script exists in this app.
- For full local backend+frontend, use `base44 dev` (see `AGENTS.md`), not `npm run dev`.

## Architecture
- Vite 6 + React 18 + `react-router-dom` v6 + `@tanstack/react-query`; Radix UI/shadcn primitives in `src/components/ui/` (vendored — excluded from stricter ESLint rules and from the `jsconfig.json` typecheck include list, don't hand-edit conventions there) + Tailwind 3.
- Base44 SDK is the only data layer: `src/api/base44Client.js` creates the single SDK client; `src/lib/app-params.js` resolves `app_id`/token/base URL from URL params → env vars → localStorage. Pages call `base44.entities.<Entity>.list/create/update` directly — there is no data-access abstraction to route through.
- Entity schemas and row-level-security rules live in `base44/entities/*.jsonc` (e.g. `Order.jsonc`, `Dessert.jsonc`, `Customer.jsonc`) — this is the backend-side source of truth, not `src/`.
- Auth is custom: `src/lib/AuthContext.jsx` manually drives Base44's low-level client (`createAxiosClient`, `base44.auth.me()`) rather than using Base44's built-in React hooks; `src/components/ProtectedRoute.jsx` gates route trees on that context.
- `src/App.jsx` nests protected routes under `src/components/admin/Layout.jsx`, the sidebar/topbar shell, which does role-based nav filtering (`admin`/`manager`/`employee`).
- Path alias: `@/*` → `src/*` (see `jsconfig.json`, `components.json`).
