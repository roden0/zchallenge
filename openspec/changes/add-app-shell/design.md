# Design

## Context

The web app currently has only a placeholder App with no routing, layout, header, tokens, or accessibility foundations. This change builds on the existing Rsbuild setup from `setup-monorepo-tooling` (React 19, TypeScript, Jest+RTL, `/api` proxy already present). The Node 18 runtime mandates react-router v6 (v7/v8 require newer Node). Icons exist in `shared/assets/icons/`: `logo.svg`, `bag_inactive.svg`, `bag_active.svg`.

## Goals / Non-Goals

**Goals:** Provide a minimal, accessible, monochrome app shell (routes + layout + header + tokens + globals) that satisfies the specs, with empty console in dev/prod and no tooling changes beyond app-local additions.

**Non-Goals:** Data fetching, BFF, catalog search/grid, product detail, cart state/view, page-specific content, i18n, SSR, deployment, dark mode.

## Decisions

### D1. Router: react-router-dom 6.30.6
Use declarative `BrowserRouter` with routes for `/`, `/products/:id`, `/cart`, and `*`. Set `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` to silence v6.28+ deprecation warnings. (The typing note about flags only affects `createBrowserRouter`; we won't use it.) Rationale: v7/v8 require Node >=20/22. Alternative: hand-rolled History-API router (smaller, no dep) but reinvents matching/params and is non-standard. **Question asked and approved:** use react-router-dom@6.30.6.

### D2. Folder layout
Follow AGENTS.md: `app/`, `features/`, `shared/`, `styles/`.
- `app/router.tsx` — route table, `BrowserRouter` + future flags.
- `app/layout/AppLayout.tsx` + `AppLayout.module.css` — shared layout (skip link, header, `<main id="main" tabindex="-1">`), owns navigation focus/scroll hook.
- `app/layout/Header/` — header component + CSS module.
- Placeholders: catalog/product-detail/cart will be replaced; put their placeholder pages under `features/catalog`, `features/product-detail`, `features/cart`. `app/NotFoundPage.tsx` (app-level).
- `shared/components/VisuallyHidden/`, `shared/hooks/usePageTitle.ts`, `shared/strings.ts`, `shared/assets/icons/`.
- `styles/tokens.css`, `styles/global.css` imported once at entry (`main.tsx`).

### D3. Header wiring
Header takes `itemCount: number` prop. Initial value `0`. The cart feature (`add-shopping-cart`) will connect the real cart state to it (no state in header).

### D4. Focus and scroll on navigation
One hook in `app/layout` that runs on location change. Skip first render (use ref). After first load: `window.scrollTo({ top: 0 })` and focus `main` (which has `tabindex="-1"`).

### D5. Document title
`usePageTitle(title)` hook in `shared/hooks` sets `document.title` on mount/updates. No extra dependency.

### D6. Typography and focus
Font stack `Helvetica, Arial, sans-serif`, weight 300. Focus-visible: `outline: 2px solid var(--color-text); outline-offset: 2px;`. Header links no underline by default. Reduced motion disables transitions/animations.

### D7. SVG/CSS typing and Jest mapping
- `apps/web/src/env.d.ts`: `/// <reference types="@rsbuild/core/types" />`.
- Jest: `moduleNameMapper` maps `\.module\.css$` and `\.css$` to a tiny local proxy (`src/test/style-mock.cjs`) returning a Proxy (so `styles.foo` → `'foo'`), and `\.svg$` to `src/test/file-mock.cjs` returning `'svg-mock'`. Local mocks, no new dep.

### D8. Favicon
Add `<link rel="icon" href="data:,">` to `public/index.html` to prevent `/favicon.ico` 404.

### D9. Sticky header and scroll-padding
Sticky header with white background; add `scroll-padding-top: var(--header-height)` to `html`/`body` so anchored elements aren't hidden.

### D10. No router warnings / console clean
BrowserRouter `future` flags set. No favicon 404. No console.*.

## Risks / Trade-offs
- React Router v6 on React 19 is fine; v7 warnings suppressed via future flags (path to v7 later when Node allows).
- Local Jest mocks are sufficient for className/SVG; can revisit if needed.
- Catalog h1 is visually hidden (preserves a11y structure).

## Open Questions (resolved)
- Router: react-router-dom@6.30.6 with future flags approved.
- Favicon: empty data URI approved.
- Jest CSS/SVG mapping: local proxy mocks (no new dep).