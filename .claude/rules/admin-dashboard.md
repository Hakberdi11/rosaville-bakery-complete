---
paths:
  - "rosaville-admin-dashboard/**"
---

# rosaville-admin-dashboard

The shop owner's back-office dashboard. Pure frontend — no backend of its own; it calls the shared Django API in `rosaville-backend/` (see `.claude/rules/rosaville-backend.md`). `AGENTS.md`/`base44 dev` references in this directory are stale (Base44 has been removed, see `.claude/rules/ecosystem.md` Goal 1) and should not be followed.

## Commands
- `npm run dev` — Vite dev server (expects the Django API running locally at `VITE_API_URL`, default `http://localhost:8000`; set in `.env.local`)
- `npm run build` — production build
- `npm run lint` / `npm run lint:fix` — ESLint (flat config, ESLint 9)
- `npm run typecheck` — `tsc -p ./jsconfig.json` (JS files with `checkJs`). Note: this produces a large number of pre-existing errors unrelated to any specific change (mostly untyped props on vendored `src/components/ui/*` components) — this predates the Django migration; don't treat its output as a regression signal without comparing counts.
- `npm run preview` — preview the production build
- No test suite/script exists in this app.

## Architecture
- Vite 6 + React 18 + `react-router-dom` v6 + `@tanstack/react-query`; Radix UI/shadcn primitives in `src/components/ui/` (vendored — excluded from stricter ESLint rules and from the `jsconfig.json` typecheck include list, don't hand-edit conventions there) + Tailwind 3.
- Data layer: `src/lib/api.js` — a plain fetch wrapper (no generic client library) calling the Django REST API. Exports `entities` (an object shaped like the old Base44 SDK — `entities.Order.list/get/create/update/delete`, etc., incl. `SpecialOfMonth` and `TeamMember` — kept intentionally similar so the migration from Base44 was a mostly mechanical import swap), `auth` (login/me/updateMe/logout, JWT access+refresh tokens in `localStorage`, auto-refresh on 401), `siteContent` (get/update against the `/api/site-content/` singleton), and `uploadFile` (multipart POST to `/api/upload/`).
- Auth: `src/lib/AuthContext.jsx` drives `auth.*` from `api.js`; `src/components/ProtectedRoute.jsx` gates route trees on it. Auth is minimal — email/password only, no Google OAuth, no self-registration. New staff accounts are created from the Employees page (`POST /api/users/`, admin-only), which returns a generated temp password shown once in the UI — there's no email delivery configured, so it must be shared with the new hire manually.
- `src/App.jsx` nests protected routes under `src/components/admin/Layout.jsx`, the sidebar/topbar shell, which does role-based nav filtering (`admin`/`manager`/`employee`).
- Pages beyond the original Base44 entity set, all backed by real endpoints (not stubs):
  - `pages/CMS.jsx` — edits the shared `SiteContent` singleton (hero/about/contact copy, business hours, social links, `primary_color`/`accent_color`). This is the one page that does **not** use `auth.updateMe`/the `User` model — site-wide public content can't live on a per-staff-account record, hence the separate singleton resource. Includes a live preview panel.
  - `pages/SpecialOfMonth.jsx` — sets/archives the public site's "dessert of the month" (`entities.SpecialOfMonth`); only one row is ever `is_active`, activating a new one auto-archives the rest (enforced server-side, not just in the UI).
  - `pages/Team.jsx` — CRUD for `TeamMember` rows shown on the public site's About page; `role`/`bio` are optional (server-validated, not just UI-optional — keep the two in sync if either changes).
- Path alias: `@/*` → `src/*` (see `jsconfig.json`, `vite.config.js`, `components.json`).
- Images (dessert/team photos, CMS hero image, sample pickers) are served from the Django backend's local media storage or a local `/placeholder-dessert.svg` — nothing points at external Base44/Manus-hosted URLs.
