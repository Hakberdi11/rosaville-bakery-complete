---
paths:
  - "rosaville-front-last/**"
---

# rosaville-front-last

The public customer-facing website. See also `rosaville-front-last/CODE_ORGANIZATION.md` for detailed per-folder conventions under `client/src/` (components/pages/contexts/hooks/utils/constants/types/data) — that file covers the client structure in depth and isn't duplicated here.

## Commands
Package manager is **pnpm** (`packageManager: pnpm@10.4.1`; includes a patched dependency in `patches/`).
- `pnpm dev` — `tsx watch server/_core/index.ts`; the Express server serves the Vite dev middleware itself, so this is the one command for both client and server in dev (no separate frontend-only dev command)
- `pnpm build` — `vite build` (client) + esbuild bundle of the server entrypoint
- `pnpm start` — run the production build (`dist/index.js`)
- `pnpm check` — `tsc --noEmit`
- `pnpm test` — `vitest run` (server-side tests only, `server/*.test.ts`; no client test setup)
- `pnpm format` — Prettier
- `pnpm db:push` — `drizzle-kit generate && drizzle-kit migrate`
- No dedicated lint script.

## Architecture
- End-to-end tRPC: `server/routers.ts` defines `appRouter` (routers: `system`, `auth`, `customCakes`, `contact`, `menu`, `team`). `client/src/lib/trpc.ts` imports the `AppRouter` type directly from the server for full type safety; calls go to `/api/trpc` via `httpBatchLink` with a `superjson` transformer (must match on both ends).
- `server/_core/` is platform/framework scaffolding: Express bootstrap (`index.ts`), tRPC init with `publicProcedure`/`protectedProcedure`/`adminProcedure` (`trpc.ts`), auth context (`context.ts`), env config (`env.ts`), plus Manus-platform integration helpers — see `.claude/rules/ecosystem.md` for the platform-independence angle on this directory.
- Data layer: Drizzle ORM against MySQL. Schema in `drizzle/schema.ts` (tables: `users`, `customCakeOrders`, `contactMessages`, `menuItems`, `teamMembers`), migrations in `drizzle/*.sql` + `drizzle/meta/`, query helpers in `server/db.ts`.
- `shared/` (`types.ts`, `const.ts`) is imported by both client and server — re-exports Drizzle row types and shared constants/error strings (e.g. `UNAUTHED_ERR_MSG`, used by the client to detect auth failures and redirect to login) so the client gets DB types without importing server code.
- Auth: no third-party auth library — custom Manus OAuth (`server/_core/sdk.ts`, `oauth.ts`) + JWT (`jose`) + cookie session (`COOKIE_NAME` from `shared/const.ts`).
- Client: React 19 + wouter (routing, patched via `patches/wouter@3.7.1.patch`) + React Query; routes defined in `client/src/App.tsx`.
- Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*` (see `tsconfig.json`, `vite.config.ts`).
- Env vars (no `.env.example` in the repo): `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL`/`BUILT_IN_FORGE_API_KEY`, `PORT` — centralized server-side in `server/_core/env.ts`.
- Convention (from `server/routers.ts`): all API routes must be under `/api/` for the gateway to route correctly.
