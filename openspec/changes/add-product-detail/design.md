# Design

## Context

See proposal.md - Why. The route `/products/:id` already exists in `router.tsx` and renders a placeholder `ProductDetailPage`; `app-routing` anticipates the real name replacing the generic title. The BFF route is done and tested (`GET /api/products/:id`, id `[A-Za-z0-9_-]{1,64}`, 400/404/502 mapping). Reusable pieces already exist: `apiFetch`/`ApiError` (abort-aware, silent), `formatPrice`, `VisuallyHidden`, `usePageTitle`, `useCart().addLine` (generates `lineId`), `contracts.ProductDetail`, and the catalog's `useProducts` state shape. StrictMode is on. No new dependencies.

## Goals / Non-Goals

**Goals:** A spec-complete detail view: fetch with loading/not-found/error+retry, a responsive layout with a color-driven image, native radio selectors with native keyboard behavior, a shared price, an add-to-cart that reuses the cart, and the specs table - with the confirmed design values recorded once.

**Non-Goals:** Similar items, cart view, quantity, wishlist, image zoom/gallery, price revalidation, SSR, shared-hook extraction, new dependencies.

## Decisions

### D1. One hook per view, not a shared fetch-state hook
`features/product-detail/hooks/useProduct.ts` mirrors the `useProducts` shape (`{ status, product, error, retry }`) for the single-resource case. Extracting a generic hook now would couple two different shapes (list with query params vs single id) for one caller each - deferred until a third consumer exists. The hook aborts the in-flight request on id change (AbortController) and ignores late responses, matching `api-client` "Aborted requests".

### D2. Id change resets state by remounting, not by effects
`ProductDetailPage` reads `useParams().id` and renders `<ProductView key={id} id={id} />`, so a new id unmounts the previous view: pending request aborted by the hook's cleanup, selections gone, image and price back to initial, button disabled - for free, with no reset bookkeeping.

### D3. Selection lives in the view, derived values are computed
`useState` holds the selected raw capacity string and the selected `ColorOption`. Nothing is pre-selected (no default in state). The displayed price, image, `alt`, button enablement and the hidden status suffix are computed from the current selection, never stored twice. Color is kept as the option object because the line needs name, hexCode and imageUrl.

### D4. Native radios, no JS for keyboard
Each group is a `fieldset`/`legend` with native `<input type="radio">` inputs styled hidden but focusable; the visible control is the `<label>` (wrapping the input). Single tab stop, arrow-key movement and roving focus are native radio behavior - no key handlers. The label carries the accessible name: capacity plus a visually hidden price suffix for storage, the color name for swatches. Focus ring via `:focus-visible` on the input reflected to the label.

### D5. Two new tokens, everything else reuses tokens.css
Add `--color-bg-primary: #000000` and `--color-border-selected: #000000` (human-confirmed). Enabled/disabled button, storage borders (`1px #CCC` / `1px #000`), swatch outline, legend/label/title typography and the desktop/tablet `380px` info column all reuse existing tokens or the confirmed values recorded in `docs/design-notes.md`.

### D6. Stable image area via CSS, not measurement
The image wrapper keeps a fixed `aspect-ratio` from the confirmed design value, so switching colors never shifts the layout. The other color images are preloaded (one request per non-selected color). Measurement-based sizing was rejected: it needs JS and adds a layout pass for no benefit.

### D7. Two small pure utils in `shared/utils`, each tested
`format-capacity.ts`: insert one space between a digit run and a following non-digit run when missing (`128GB` -> `128 GB`; `128 GB`, `1 TB` unchanged; anything unexpected returned unchanged). `hex-code.ts`: `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i` guard with a neutral fallback used by the swatch. Both are framework-free and unit-tested.

### D8. Cart wiring reuses `addLine` as-is
The view calls `useCart().addLine({ productId, brand, name, imageUrl: color.imageUrl, storage: { capacity: raw, price }, color: { name, hexCode } })`; the provider generates the `lineId`, so repeated additions of the same configuration produce two independent, individually removable lines (cart-state). Feedback is the shared `role="status"` `{name} added to cart.` plus the existing header count.

### D9. No new dependency, no tooling change
Everything is React, the platform, and code already in the repo. No CSS or testing library is added; CSS Modules and the existing Jest/RTL setup cover this.

## Risks / Trade-offs

- `formatPrice` always prints two decimals, so integers render `1329,00 EUR` while `docs/design-notes.md` still proposes decimals-only-when-present -> left as-is; the pending proposal is out of scope here and the detail view reuses the formatter unchanged.
- The four price labels (`basePrice`, per-capacity, specs) are rendered with the shared formatter, matching `product-price`; if the decimals proposal lands later it changes them all at once.
- Preloading every other color image costs `N-1` requests per product -> accepted; galleries are out of scope.
- `app-routing` says the detail placeholder title is generic "until the product feature sets the real name"; the six existing `AppRoutes` test files render routes and may need their fetch mocks updated in this change (the spec anticipated this, so no test is weakened).
- The exact mobile specs-label width and row height remain `[CONFIRM]` in `docs/design-notes.md`; the table is fluid on mobile and `300px` label column on desktop/tablet.

## Open Questions

None - specs, approach and task breakdown are settled.
