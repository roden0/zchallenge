# Tasks: add-product-detail

## 1. Verify starting point

- [x] 1.1 Confirm the route `/products/:id` and the placeholder `ProductDetailPage` exist, that `apiFetch`/`ApiError`, `formatPrice`, `VisuallyHidden`, `usePageTitle`, `useCart().addLine` and `contracts.ProductDetail` are present, and that `openspec/changes/add-product-detail/` is scaffolded; report anything unexpected and STOP if a claim fails (verify: findings reported against `router.tsx`, `ProductDetailPage.tsx`, `shared/api/client.ts`, `shared/utils/format-price.ts`, `shared/cart/useCart.ts`, `packages/contracts`).

## 2. Shared utilities

- [x] 2.1 Create `apps/web/src/shared/utils/format-capacity.ts`: one space between digit run and following non-digit run; `128GB` -> `128 GB`; `128 GB`, `1 TB` and unexpected input unchanged (verify: `pnpm typecheck` passes).
- [x] 2.2 Create `apps/web/src/shared/utils/hex-code.ts`: `isHexCode` guard for `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i` and a neutral fallback constant (verify: `pnpm typecheck` passes).
- [x] 2.3 Unit-test both: `128GB`/`128 GB`/`1 TB`/unexpected; valid 3- and 6-digit hex, missing `#`, wrong length and non-hex rejected (verify: `pnpm test` green for these).

## 3. Tokens and strings

- [x] 3.1 Add `--color-bg-primary` and `--color-border-selected` to `apps/web/src/styles/tokens.css` with the confirmed `#000000` values; verify every other needed value reuses an existing token (verify: file diff shows only the two tokens added).
- [x] 3.2 Add the detail-view strings to `apps/web/src/shared/strings.ts`: legends, `SPECIFICATIONS`, `AÑADIR`, `LOADING...`, `COULD NOT LOAD PRODUCT`, `RETRY`, `PRODUCT NOT FOUND`, hint, added-to-cart status, spec row labels, and the `BACK` link name (verify: `pnpm typecheck` passes; no literal UI string remains in the components).

## 4. Data hook and states

- [x] 4.1 Create `apps/web/src/features/product-detail/api/getProduct.ts` using `apiFetch` with a URL-encoded id (verify: `pnpm typecheck` passes).
- [x] 4.2 Create `hooks/useProduct.ts` with the `useProducts` shape (`status | product | error | retry`), aborting the previous request on id change via `AbortController` and ignoring late/aborted responses without logging (verify: `pnpm typecheck` passes).
- [x] 4.3 Wire `ProductDetailPage` to `useParams` and render `<ProductView key={id} id={id} />`; render loading (`role="status"` `LOADING...` + back link, no product content), not-found (`h1` `PRODUCT NOT FOUND` + back link, no retry) and error (`role="alert"` `COULD NOT LOAD PRODUCT` + `RETRY`, never the raw message/status); set the document titles via `usePageTitle` (verify: `pnpm typecheck`, `pnpm lint` pass).
- [x] 4.4 Test the data states with a mocked network boundary: loading, success title, 404 and 400 -> not-found, 502 and network failure -> error, invalid JSON -> error, retry re-requests and re-shows loading, id change aborts and ignores the late response, and no raw error text appears (verify: `pnpm test` green).

## 5. Layout shell

- [x] 5.1 Build `ProductView` structure: `< BACK` link to `/` (glyph `aria-hidden`, accessible name `BACK`, rendered in every state), always exactly one `h1` (name uppercase when loaded, visually hidden generic while loading/on error) (verify: `pnpm lint`, `pnpm typecheck` pass).
- [x] 5.2 Style the responsive arrangement: centered ~`1200px` container, image area left (`510px`) and `380px` info column right on desktop, side by side with a `380px` info column on tablet, stacked full width on mobile; apply the confirmed vertical rhythm; reading order name, price, storage, color, add button (verify: no horizontal scroll at `393px`, `834px` and `1920px` in the browser).

## 6. Image and specifications

- [x] 6.1 Render the color-driven image: first color option before any selection, selected color's image after; `alt` = product name, then `{name}, {color name}`; fixed `aspect-ratio` on the wrapper and preload of the other color images (verify: image/alt update on selection and no layout shift).
- [x] 6.2 Render the `SPECIFICATIONS` `h2` and a real table with `scope="row"` headers in the fixed row order, values as received, missing values as `-`, and no rating anywhere (verify: `pnpm test` green for the table tests).
- [x] 6.3 Style the table (`300px` label column desktop + tablet, ~`46px` rows, fluid mobile) using tokens (verify: `pnpm lint` passes; browser check of the table).

## 7. Options

- [x] 7.1 Build the storage radio group: `fieldset`/`legend`, native visually-hidden inputs, styled labels, `formatCapacity` label text, visually hidden price suffix in the accessible name, raw capacity as the radio value, nothing pre-selected (verify: `pnpm typecheck` passes).
- [x] 7.2 Build the color radio group: same structure with square swatches (`hexCode` background or neutral fallback via `isHexCode`), color name as accessible name, selected color name shown under the swatches only after selection (verify: `pnpm typecheck` passes).
- [x] 7.3 Style selected and focused states: storage selected `1px #000` vs `1px #CCC`, swatch `1px #000` outline, visible `:focus-visible` ring on the label; ensure one tab stop per group and native arrow-key movement (verify: browser keyboard check passes).
- [x] 7.4 Handle missing groups: empty `storageOptions` or `colorOptions` renders no group, does not crash, and leaves the button disabled (verify: `pnpm test` green).
- [x] 7.5 Test options: nothing auto-selected (including single-option products), one selection per group, capacity normalization and hidden price suffix, raw value kept, swatch accessible name, invalid hexCode fallback, selected-name visibility (verify: `pnpm test` green).

## 8. Price

- [x] 8.1 Derive the price: `From {basePrice} EUR` from `formatPrice` before a storage selection, the option's formatted price without `From` after; independent of color (verify: `pnpm test` green for the price tests).
- [x] 8.2 Test price behavior including two options with the same price and a decimal value (comma separator) (verify: `pnpm test` green).

## 9. Add to cart

- [x] 9.1 Build the `AÑADIR` button: fills the info column, `56px` high, natively disabled until storage and color are selected, with the visually hidden hint linked by `aria-describedby` and placed immediately after the button in reading order (verify: `pnpm typecheck`, browser check).
- [x] 9.2 Wire activation to `useCart().addLine` with product id/brand/name, the selected color image, storage (raw capacity + price) and color (name + hexCode); keep the selection after adding and render the `role="status"` `{name} added to cart.` (verify: header count increments).
- [x] 9.3 Test add-to-cart: disabled states for none/one selection, enabled with both, payload contents (selected color image), selection kept, two activations add two lines, status text and header count after adding (verify: `pnpm test` green).

## 10. Documentation

- [x] 10.1 Update `docs/design-notes.md`: record the confirmed detail-view values (button colors, storage/swatch borders, selected color name, section titles, specs label/value, legends, back link, `300px` specs label column desktop+tablet with mobile and row height still `[CONFIRM]`, and the desktop rhythm) and remove the resolved `[CONFIRM]` markers (verify: the confirmed values are present and no longer marked open).
- [x] 10.2 Update `README.md`: describe the detail view (states, titles, selectors, add-to-cart) and note the specs-label mobile width and row height as still `[CONFIRM]` (verify: section present and accurate).

## 11. Final verification

- [x] 11.1 `pnpm lint`, `pnpm typecheck` and `pnpm test` all pass (verify: commands exit 0).
- [x] 11.2 Manual browser check: load a real product, exercise colors/storage (image, price, enablement), add to cart twice, check the header count, the specs table, not-found and error+retry paths, the three breakpoints, keyboard-only operation of both groups, and an empty console throughout; if a temporary harness is used, remove it and re-run `pnpm test` + `pnpm lint` (verify: checks green, console clean, harness gone from the diff).
