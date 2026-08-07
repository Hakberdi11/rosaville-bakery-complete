---
paths:
  - "rosaville-front-last/**"
---

# rosaville-front-last

The public customer-facing website. Pure frontend — no backend of its own; it calls the shared Django API in `rosaville-backend/` (see `.claude/rules/rosaville-backend.md`). `server/`, `drizzle/`, and `shared/` no longer exist (removed along with Express/tRPC/Drizzle/Manus — see `.claude/rules/ecosystem.md` Goal 1). See also `CODE_ORGANIZATION.md` for detailed per-folder conventions under `client/src/` — still accurate for the frontend structure, just ignore anything it says about `server/`.

## Commands
Package manager is **pnpm** (`packageManager: pnpm@10.4.1`; includes a patched dependency in `patches/`).
- `pnpm dev` — Vite dev server (expects the Django API running locally at `VITE_API_URL`, default `http://localhost:8000`; set in `.env`)
- `pnpm build` — `vite build`
- `pnpm preview` — preview the production build
- `pnpm check` — `tsc --noEmit`
- `pnpm format` — Prettier
- No test suite or lint script currently exist (the old `server/*.test.ts` tests were removed with the server).

## Architecture
- Data layer: `client/src/lib/api.ts` — a plain fetch wrapper calling the Django REST API: `desserts` (`.list`, `.get`, `.listGallery` — the last filters to the dashboard's curated `in_gallery` picks), `specialOfMonth.getCurrent()`, `siteContent.get()`, `contact.submit`, `customCakes.submit`, `team.list`, `newsletter.subscribe`, `orders.submit`, `uploadFile`.
- Client: React 19 + wouter (routing, patched via `patches/wouter@3.7.1.patch`) + `@tanstack/react-query` (installed but not deeply wired — most data fetching is plain `useEffect` + `api.*`); routes defined in `client/src/App.tsx`. **Use wouter's `<Link>` for every internal navigation, never a raw `<a href="/...">`** — a raw anchor causes a full page reload, which silently wipes `CartContext`/`FavouritesContext` state since neither persists to storage (this was a real, repeatedly-made bug; several pages had it).
- `contexts/SiteContentContext.tsx` (`SiteContentProvider`, wraps the app in `App.tsx`) fetches the `SiteContent` singleton once and applies `primary_color`/`accent_color` as runtime CSS variable overrides on `document.documentElement` (with an auto-computed readable foreground color per swatch) — this is what makes the dashboard CMS's color pickers actually restyle the live site. `useSiteContent()` also exposes the fetched hero/about/contact copy, consumed by `Home.tsx`, `About.tsx`, `Contact.tsx`, `Footer.tsx`.
- **Color system**: `index.css`'s `:root` defines the real palette as CSS custom properties (`--primary`, `--accent`, `--background`, `--foreground`, `--border`, `--muted`, plus a fixed (non-personalizable) `--cta`/`--cta-hover` pair used for "Add to Cart"-style actions, kept deliberately separate from the owner-configurable brand primary/accent). Every page uses the Tailwind semantic classes (`bg-primary`, `text-foreground`, `border-cta`, etc.) — **do not reintroduce arbitrary hex classes like `bg-[#C9949B]`**; the whole site used to be riddled with near-duplicate hardcoded hex values that drifted per-page, which is exactly what made the color picker impossible before this was cleaned up. `RoseIcon.tsx`'s SVG fills are the one deliberate exception (a static decorative logo mark, not a themeable surface).
- Dessert data is shared with the dashboard's Desserts page (see `.claude/rules/ecosystem.md` Goal 2 on the unified `Dessert` model) and flows through: `Menu.tsx`/`MenuItem.tsx`/`ProductDetail.tsx` (full listing + detail, incl. prep time/allergens/ingredients/availability badges), `Home.tsx` (featured desserts + current special), `Gallery.tsx`/`GalleryCarousel.tsx` (curated `in_gallery` desserts — no more separate hardcoded gallery dataset), `SpecialDessert.tsx` (current `SpecialOfMonth`, dashboard-managed). `Menu.tsx`'s "Learn More" links to `/product/:id` → `ProductDetail.tsx`; `/menu-item/:id` → `MenuItem.tsx` is a parallel, fully-wired but currently unreachable route (nothing links to it) — harmless to leave, don't assume it's dead weight if reviving it.
- Checkout (`Checkout.tsx`) creates a real `Order` via `api.orders.submit` (visible immediately in the dashboard's Orders page) — it used to be a pure `console.log` + `alert()` placeholder with zero persistence, a real bug, not a stub left on purpose. Cart itself (`CartContext`) is still in-memory only with no localStorage — only checkout persists.
- `CustomCakes.tsx`'s inspiration-image picker actually uploads the file via `api.uploadFile` and includes the resulting URL in the submission now — it used to preview the image locally and silently drop it before sending.
- No staff/customer auth on this app — there's no login button; the site is fully public-read, form-submissions-are-public-create (matches the backend's `CreateOnlyOrIsStaff`/`AllowAny` permissions).
- Path aliases: `@/*` → `client/src/*` (see `tsconfig.json`, `vite.config.ts`). The old `@shared/*` alias is gone along with `shared/`.
- Env vars: `VITE_API_URL` (Django API base URL). No `.env.example` file exists yet.
- Dead code from the pre-migration scaffold (`data/products.ts`, `data/galleryData.ts`, `types/index.ts`, `constants/`, `utils/`, the `streamdown` dependency) has been removed — if you find a file that looks unused, verify with a repo-wide grep before assuming it's load-bearing, but don't assume everything old is still there to clean up either.
