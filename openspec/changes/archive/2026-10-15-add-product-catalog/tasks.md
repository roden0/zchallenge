# Tasks: add-product-catalog

## 1. Verify starting point
- [x] 1.1 Confirm BFF `/api/products` works as expected (limit=20, search=sam returns 6). If missing, STOP.
- [x] 1.2 Confirm contracts package exports ProductSummary/ProductDetail types. Decide type location if absent (ask if needed).
- [x] 1.3 Check design-notes.md for confirmed values; add card border, search underline, counter typography if missing (as provided).
- [x] 1.4 Review existing shell (tokens, strings, VisuallyHidden).

## 2. Design tokens and design notes
- [x] 2.1 Update `apps/web/src/styles/tokens.css` with `--color-border-card: #000000` and `--color-border-search-underline: #000000`.
- [x] 2.2 Update `docs/design-notes.md` with card border color, search underline color, and counter typography confirmation.

## 3. Shared utilities and hooks
- [x] 3.1 Create `apps/web/src/shared/utils/format-price.ts` with `formatPrice(price: number): string` (comma decimals, two places, no thousands, " EUR").
- [x] 3.2 Create `apps/web/src/shared/utils/format-price.test.ts`.
- [x] 3.3 Create `apps/web/src/shared/api/client.ts` with typed fetch wrapper (path + AbortSignal, relative /api, typed errors for non-2xx/network/invalid JSON).
- [x] 3.4 Create `apps/web/src/shared/api/client.test.ts`.
- [x] 3.5 Create `apps/web/src/shared/hooks/useDebouncedValue.ts`.
- [x] 3.6 Create `apps/web/src/shared/hooks/useDebouncedValue.test.ts`.

## 4. Catalog data hook
- [x] 4.1 Create `apps/web/src/features/catalog/api/getProducts.ts` (fetch function using client, builds query with limit=20).
- [x] 4.2 Create `apps/web/src/features/catalog/hooks/useProducts.ts` (state shape, request id/token, abort, stale ignore, reload).
- [x] 4.3 Create `apps/web/src/features/catalog/hooks/useProducts.test.ts`.

## 5. ProductCard component
- [x] 5.1 Create `apps/web/src/shared/components/ProductCard/ProductCard.tsx` (link to /products/{id}, decorative image, brand/name/price, eager for first 5).
- [x] 5.2 Create `apps/web/src/shared/components/ProductCard/ProductCard.module.css` (layout, aspect ratio, hover layer with transform, reduced motion).
- [x] 5.3 Create `apps/web/src/shared/components/ProductCard/index.ts`.
- [x] 5.4 Create `apps/web/src/shared/components/ProductCard/ProductCard.test.tsx`.

## 6. Catalog page implementation
- [x] 6.1 Create `apps/web/src/features/catalog/components/SearchBar.tsx` (underline input, label, clear button, form role="search", max 100, hide native clear).
- [x] 6.2 Create `apps/web/src/features/catalog/components/ResultsCounter.tsx` (role="status", pluralization, LOADING).
- [x] 6.3 Create `apps/web/src/features/catalog/components/ProductGrid.tsx` (ul/li, responsive columns, borders, spacing).
- [x] 6.4 Implement `apps/web/src/features/catalog/CatalogPage.tsx` (URL sync, debounced search, loading/empty/error states, aria-busy, focus on retry success).
- [x] 6.5 Update catalog placeholder if needed to match new implementation (or replace it).

## 7. Tests (catalog integration)
- [x] 7.1 Catalog initial load: first request /api/products?limit=20, 20 cards, counter "20 RESULTS", each card links correctly, image alt="".
- [x] 7.2 Search behavior: typing "sam" quickly produces one request with search=sam after 300ms, previous cards visible during pending, stale responses ignored.
- [x] 7.3 Clear button: absent when empty, present when text; clears, requests full list immediately, focuses field.
- [x] 7.4 Counter pluralization: "1 RESULT", "0 RESULTS".
- [x] 7.5 Error state: shows alert + RETRY, hides grid/counter; retry succeeds, focuses search field.
- [x] 7.6 URL sync: /?q=samsung initializes correctly, updates with replace, clears param when empty, Back restores.
- [x] 7.7 Initial loading shows "LOADING..." and no grid.

## 8. Final verification
- [x] 8.1 `pnpm lint`, `pnpm typecheck`, `pnpm test` all pass.
- [x] 8.2 Manual check: BFF + web together, 393/834/1920px columns, hover/focus, horizontal scroll none, console empty (including prod build).
