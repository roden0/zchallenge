# Tasks

## 1. Verify the starting point

- [x] 1.1 Confirm `shared/components/ProductCard` supports reuse here (structure, hover/focus, `eager` prop, decorative image) and is in `shared/` - verify by reading `ProductCard.tsx`, `ProductCard.module.css` and its test, all consistent with the catalog.
- [x] 1.2 Confirm the detail response already carries cleaned similar products - verify with one real `curl` of `/api/products/{id}` through the BFF showing no entry for the current id, no duplicate ids, and `https` image URLs.
- [x] 1.3 Confirm navigation already resets the detail view and cancels stale requests - verify by reading `app/layout/useNavigationFocusScroll.ts` (scroll top + focus `#main` on pathname change) and `product-detail/ProductDetailPage.tsx` (`key={id}` remount).

## 2. Section component

- [x] 2.1 Add `strings.detailSimilarHeading: 'SIMILAR ITEMS'` to `shared/strings.ts` - verify no literal is used in the component (strings live in one module).
- [x] 2.2 Create `features/product-detail/components/SimilarProducts.tsx`: a plain `<section>` with an `<h2>` and a `ul[role="list"]` mapping `similarProducts` to `<ProductCard product={p} eager={index < 3} />`, returning `null` when the list is empty; imports only from `shared/` - verify `pnpm typecheck` is clean.
- [x] 2.3 Add `SimilarProducts.test.tsx`: one link per product in order with `href` `/products/{id}`, the `SIMILAR ITEMS` `h2` present, and nothing rendered for an empty list - verify `pnpm test SimilarProducts` passes.

## 3. Width, bleed and scrollbar layout

- [x] 3.1 Add the row styles to `ProductView.module.css`: item width per breakpoint per the design (desktop `calc((100vw - padding*2)/5)`, tablet two-column, mobile near-full with a peek), the scroll row (`display:flex; overflow-x:auto; list-style:none`), the container-aligned left (`margin-left: max(0px, calc((100% - 1200px)/2))`), the viewport-right bleed (`margin-right: calc(-1 * var(--page-padding-*))` per breakpoint), the desktop spacing (a measured `150px`/`45px`), and the native scrollbar styling (`scrollbar-width: thin; scrollbar-color: #000 #ccc`) with a `12px` gap between the cards and the bar (`padding-bottom`) - verify by inspecting computed styles in the browser check (task 5.3).
- [x] 3.2 Record the scrollbar values, the section spacing and the mobile peek offset in `docs/design-notes.md`, marking the approximate ones `[CONFIRM]` - verify the values in the doc match the CSS.

## 4. Wire into the detail view

- [x] 4.1 Render `<SimilarProducts products={product.similarProducts} />` after the specifications section in `ProductView.tsx`, relying on the component's own empty case - verify the existing detail tests still pass (`similarProducts: []` by default renders nothing extra).
- [x] 4.2 Add navigation tests to `ProductDetailPage.test.tsx`: activating a card fetches the new id, aborts the previous request, shows the new product with selections reset (button disabled, price back to `From {price}`), and no card links to the current product - verify `pnpm test ProductDetailPage` passes.

## 5. Final verification

- [x] 5.1 Run `pnpm lint` and `pnpm typecheck` and verify both exit 0.
- [x] 5.2 Run `pnpm test` and verify the full web and BFF suites pass.
- [x] 5.3 Manual browser check at `393px`, `834px` and `1920px`: card widths match the catalog, the next card peeks at the right edge, the row scrolls while the page does not, the scrollbar shows, Tab reaches and scrolls to each card, hover works, activating a card loads it and Back returns, and the console stays empty. If a temporary harness is used, remove it and re-run `pnpm test` + `pnpm lint`.

## Workflow follow-up

- Archive the change after human review, folding the two new specs into `openspec/specs/`.
