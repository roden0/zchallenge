# Tasks

## 1. Check starting point
- [x] 1.1 Verify icons exist: `apps/web/src/shared/assets/icons/logo.svg`, `bag_inactive.svg`, `bag_active.svg` and open them (size/viewBox match description). Report anything unexpected.
- [x] 1.2 Inspect current web scaffold (rsbuild, tsconfig, jest, index.html, App.tsx/main.tsx) and note gaps (SVG/CSS typing, Jest mapping) before continuing.

## 2. Tokens, global styles, strings, VisuallyHidden (with tests where behavioral)
- [x] 2.1 Create `apps/web/src/styles/tokens.css` with all specified tokens (7 colors, 6 font-sizes + weight 300, header 80px, hover duration/easing, page padding per breakpoint) and breakpoint comment (600px/1024px). Do not add [CONFIRM] values.
- [x] 2.2 Create `apps/web/src/styles/global.css` with minimal reset, box-sizing, font stack, weight 300, bg/text, base font, focus-visible styles, reduced motion, scroll-padding-top (header height). Header links no underline by default.
- [x] 2.3 Create `apps/web/src/shared/strings.ts` with strings needed by shell (logo name, cart labels, titles, not-found).
- [x] 2.4 Create `apps/web/src/shared/components/VisuallyHidden/VisuallyHidden.tsx` (CSS module or inline styles that hide visually but keep in SR tree). Export named export.
- [x] 2.5 Add `apps/web/src/env.d.ts` with `/// <reference types="@rsbuild/core/types" />`.
- [x] 2.6 Add local Jest mocks: `apps/web/src/test/style-mock.cjs` (Proxy returning key) and `apps/web/src/test/file-mock.cjs` (returns 'svg-mock'), and update `apps/web/jest.config.cjs` `moduleNameMapper` for `.module.css`, `.css`, `.svg`.
- [x] 2.7 Wire globals in `apps/web/src/app/main.tsx` (import `../styles/tokens.css` and `../styles/global.css`). Add favicon link to `apps/web/public/index.html` (`data:,`).

## 3. Router, route table, not-found
- [x] 3.1 Add dependency `react-router-dom@6.30.6` to `apps/web/package.json`.
- [x] 3.2 Create placeholder pages: `features/catalog/CatalogPage.tsx`, `features/product-detail/ProductDetailPage.tsx`, `features/cart/CartPage.tsx`, `app/NotFoundPage.tsx` (each renders minimal content with one h1 as specified).
- [x] 3.3 Create `apps/web/src/app/router.tsx` with `BrowserRouter` (future flags v7_startTransition, v7_relativeSplatPath) and routes `/`, `/products/:id`, `/cart`, `*` pointing to placeholders.
- [x] 3.4 Replace `apps/web/src/app/App.tsx` to use the router (or keep App thin; router is primary). Update wiring if needed.
- [x] 3.5 Create `apps/web/src/shared/hooks/usePageTitle.ts`.

## 4. Layout: skip link, header shell, main, focus and scroll hook
- [x] 4.1 Create `apps/web/src/app/layout/useNavigationFocusScroll.ts` (skips first render; on location change after first, scroll to top and focus `main` with `tabindex="-1"`).
- [x] 4.2 Create `apps/web/src/app/layout/AppLayout.tsx` with skip link, header+nav shell, `<main id="main" tabindex="-1">` rendering children; uses hook.
- [x] 4.3 Wrap routes in `AppLayout`.

## 5. Header component
- [x] 5.1 Create `apps/web/src/app/layout/Header/Header.tsx` and `Header.module.css` (props `itemCount: number`). Logo link to `/` named "MBST, home" (logo alt=""), cart link to `/cart` with bag icon + count (names by count, icons decorative). Bag icon by count (0 inactive, >=1 active). Count always visible. Height 80px, padding from page padding token, sticky white bg.
- [x] 5.2 Wire Header into AppLayout passing `0`.

## 6. usePageTitle and h1 per view
- [x] 6.1 Apply `usePageTitle` in each page (catalog "Smartphones | MBST", detail "Product | MBST" generic, cart "Cart | MBST", not-found "Page not found | MBST").
- [x] 6.2 Ensure each view has exactly one h1: catalog visually hidden "Smartphones"; detail/cart/not-found visible as appropriate.

## 7. Tests
- [x] 7.1 Header: links, names, icon by count, decorative alt.
- [x] 7.2 Routing (memory router): placeholders in main with one h1 per route, unknown → not-found with link to /, header present on every route.
- [x] 7.3 Navigation: focus on main + scrollTo reset after nav; first render doesn't steal focus.
- [x] 7.4 Skip link: first Tab, activating moves focus to main.
- [x] 7.5 Titles: each route sets expected document.title.
- [x] 7.6 Landmarks: one banner, one main, one nav labelled "Main".

## 8. Update docs/design-notes.md
- [x] 8.1 Record: header height 80px all widths (tablet/mobile [CONFIRM] — inferred), count typography [CONFIRM], sticky [CONFIRM], header count prop and add-shopping-cart wiring.

## 9. Final verification
- [x] 9.1 `pnpm lint`, `pnpm typecheck`, `pnpm test` all pass.
- [x] 9.2 `pnpm dev`, then `pnpm build` + `pnpm start`; verify at 393/834/1920: header matches, console empty, skip link works, focus moves to main, cart shows inactive "0".
- [x] 9.3 Report what was run and issues.
