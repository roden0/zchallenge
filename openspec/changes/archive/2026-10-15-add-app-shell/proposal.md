# Proposal

## Why

The web app currently has only a placeholder App with no routing, no shared layout with header, no design tokens/global styles, and no accessibility foundations. Before adding catalog/product/detail/cart features, we need a solid app shell (routes, layout, header, tokens, globals) so all three views render consistently in the same monochrome style, with proper landmarks, focus management, document titles, and no console noise.

## What Changes

- Add design tokens and global styles (CSS Modules + `tokens.css` + one global stylesheet imported at entry).
- Add client-side routing with react-router-dom 6.30.6: `/`, `/products/:id`, `/cart`, and a not-found fallback, all inside the shared layout with minimal placeholders.
- Add the shared page layout and header: sticky header (80px) with logo link and cart link showing bag icon + item count (prop `0` for now). Icons added under `shared/assets/icons/`.
- Add accessibility foundations: skip link, focus-visible styles, reduced-motion support, no zoom-lock in viewport, `html lang="en"`, `main` focus/scroll on navigation after first load, one `h1` per view (catalog visually hidden), `strings.ts`, `VisuallyHidden` component.
- Add favicon link (empty data URI) to suppress `/favicon.ico` 404; add type declarations/env typings for SVG/CSS modules and Jest mapping for CSS/SVG.
- Add `react-router-dom@6.30.6` as a new dependency (Node 18+React 19 compatible; uses BrowserRouter with `future` flags to silence v7 warnings).

## Capabilities

### New Capabilities

- **app-routing** — client-side routes and behavior: three views inside shared layout, not-found, SPA navigation, scroll-to-top + focus to main after first load, document titles, one `h1` per view (catalog visually hidden).
- **app-header** — sticky header with logo and cart link, item count, bag icon states, accessible names, height/padding.
- **design-tokens** — CSS variables on `:root` covering colors, type scale, weight, header height, hover timing, page padding per breakpoint.
- **app-foundations** — global reset/typography, focus styles, reduced motion, viewport, skip link, landmarks, strings module, VisuallyHidden component, console-clean guarantees.

### Modified Capabilities

None. No existing spec requirements change.

## Impact

- **apps/web** — new layout, header, router, pages/placeholders, hooks (`usePageTitle`, navigation focus/scroll), styles (tokens/global), `env.d.ts`, `shared/strings.ts`, `shared/components/VisuallyHidden`, Jest setup tweaks (moduleNameMapper for CSS/SVG) and minor `index.html` tweak.
- **Dependencies** — add `react-router-dom@6.30.6` to `apps/web/package.json` (declarative BrowserRouter; future flags set to suppress v7 warnings).
- **Docs** — update `docs/design-notes.md` with header height on tablet/mobile [CONFIRM], count typography [CONFIRM], sticky [CONFIRM], and any recorded decisions.
- **Risks** — none material; this is pure UI shell. The Node 18 mandate forces use of react-router v6 (no v7/v8). The future flags silence the v6 deprecation warnings without changing runtime behavior.
