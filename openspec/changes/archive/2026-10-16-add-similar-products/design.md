# Design

## Context

See proposal.md - Why. The detail view (`features/product-detail`) already renders a centered `1200px` container (image + info) and a `SPECIFICATIONS` section; the response already carries BFF-cleaned `similarProducts` (deduped, without the current product, `https` images). `shared/components/ProductCard` already supports reuse here (catalog hover/focus, `eager` prop, decorative image). The shell's `useNavigationFocusScroll` scrolls to top and focuses `#main` on every pathname change, and `ProductDetailPage` remounts `ProductView` on id change (`key={id}`), so a detail-to-detail navigation already resets state and aborts the old request. No new dependency.

## Goals / Non-Goals

**Goals:** A `SIMILAR ITEMS` section that reuses `ProductCard`, sizes cards like the catalog, aligns its left edge with the detail content and bleeds to the viewport's right edge, styles the native scrollbar, and relies on existing navigation behavior.

**Non-Goals:** Carousel buttons, auto-scroll, scroll-snap, extra/synthesized similar products, any BFF change, any change to the catalog or the detail layout above.

## Decisions

### D1. The section lives in the detail feature
`features/product-detail/components/SimilarProducts.tsx` owns the section. It is specific to the detail view; placing it there keeps the feature boundary (it imports only from `shared/`: `ProductCard` and `strings`) and avoids a `shared/` component with a single consumer. It MUST NOT import from another feature.

### D2. Reuse `ProductCard`, do not re-implement the card
The row maps `similarProducts` to `<ProductCard product={p} eager={index < 3} />`. Hover, focus, typography, price formatting, decorative `alt`, and lazy/eager loading all come from the existing card, so the catalog and the row can never drift. The catalog makes the first five eager; the row only the first three (fewer are above the fold).

### D3. Layout: container-aligned left, viewport-right bleed, via negative margin
`.page` carries the `100/40/16px` padding. The section is a child of `.page` and gets:
- `margin-left: max(0px, calc((100% - 1200px) / 2))` - aligns with the centered `1200px` container on desktop and collapses to `0` at tablet/mobile widths (page padding).
- `margin-right: calc(-1 * var(--page-padding-*))` (per breakpoint) - pulls the right edge out to the viewport edge.

The inner row is a `ul[role="list"]` with `display:flex; overflow-x:auto`. The row is the only horizontal scroller; the page never scrolls sideways. Negative margins were chosen over a full-bleed wrapper because the right edge lands exactly on the viewport edge with no extra markup and no `overflow` on ancestors (which would clip the row).

Arithmetic: `1920` → left `360`, right `1920`; `834` → `40`→`834`; `393` → `16`→`393`.

### D3b. Card width from the catalog column count, not a fixed px
Each item width reproduces a catalog card at the same breakpoint using the viewport and the same padding tokens, so it tracks the catalog fluidly instead of matching only at `1920`:
- desktop: `calc((100vw - var(--page-padding-desktop) * 2) / 5)` (≈`344px` at `1920`, and `≈165px` at `1024`, matching the catalog's 5 columns).
- tablet: `calc((100vw - var(--page-padding-tablet) * 2) / 2)` (the catalog's two-column width).
- mobile: `calc(100vw - var(--page-padding-mobile) * 2 - 40px)` - close to the full content width but leaves a sliver of the next card visible.

A hard-coded `344px` was rejected: it would only equal the catalog card at `1920px` and diverge as the catalog cards shrink. The exact mobile peek offset (`40px`) is `[CONFIRM]`.

### D4. Native scrollbar via the standard properties
Use `scrollbar-width: thin; scrollbar-color: #000 #ccc` (reusing `--color-text` and `--color-border-control`, no new tokens). The bar is left to the engine, per the design note, rather than hand-built. Measured in Chromium: once `scrollbar-color` is set, Blink ignores the `::-webkit-scrollbar*` pseudo-elements, so a `1px` line is not achievable while also carrying the colours; `scrollbar-width: thin` wins and the bar is ~10px in Chromium (~8px in Firefox), with a `#000` thumb on a `#ccc` track. Earlier drafts also had `::-webkit-scrollbar { height: 1px }` + `-thumb`/`-track`; that block is inert in Chromium and would forfeit all styling in Firefox, so it was dropped in favour of a consistent "thin, dark thumb on a light track" in both engines. Because cards have their natural (catalog-like, ragged) heights, the tallest card would otherwise touch the bar: the row gets `padding-bottom` so the bar always sits a little below the cards.

### D5. Plain section, no landmark
The section is a plain `<section>` with an `<h2>` and no `aria-label`/`role`, exactly like `SPECIFICATIONS`. A named region would add a landmark for a single section with no navigation value; the heading is enough. The row is a real list (`ul role="list"` to restore semantics lost with `list-style: none`).

### D6. No client-side self-filter
The BFF already removes the current product from `similarProducts` (`cleanSimilarProducts`). Re-filtering in the component would duplicate the contract; the web app renders what the BFF returns. The test asserts the observable result (no card for the current id) against a payload that matches the BFF contract.

### D7. Keyboard access needs no extra code
The cards are links inside the scroll container, so tabbing focuses them and the browser scrolls the focused link into view. No `tabindex` or scroll handlers, consistent with the catalog.

## Risks / Trade-offs

- The scrollbar thickness is engine-defined (`thin` ≈ `10px` Chromium, `≈8px` Firefox) and cannot be a `1px` hairline while also carrying `scrollbar-color`; the "thin, dark thumb on a light track" requirement is met in both engines → accepted and documented.
- `100%` in `margin-left` resolves against the `.page` content box; if the page padding or the `1200px` container changes, the offset follows automatically, but both magic numbers now live in the CSS and `docs/design-notes.md`.
- `formatPrice` still prints two decimals (`1329,00 EUR`) → the row reuses it unchanged, matching the catalog and the existing pending-decimal proposal.

## Open Questions

None - specs, approach and task breakdown are settled.
