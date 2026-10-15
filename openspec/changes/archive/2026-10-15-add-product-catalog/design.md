# Design: add-product-catalog

## Data hook
- `useProducts(search: string | undefined)` manages state shape `{ loading: boolean; success: boolean; error: Error | null; data: ProductSummary[] }`
- Keeps previous `data` while refetching (to avoid flashing empty grid). Sets `loading=true`, `error=null` when starting new request; sets `success=true`, `loading=false`, `data=...` on success; sets `error`, `loading=false`, `success=false` on failure.
- Exposes `reload()` to retry the last query (reuses last search value).
- Stale response handling: track request id or latest search token; ignore responses where the token doesn't match current search, or increment a version per request.
- Abort handling: create `AbortController` per request; on cleanup or new request, abort previous; swallow abort errors (do not set state, do not log).
- Under React StrictMode, effects run twice in dev - ensure aborted requests from first run don't produce noise.

## URL sync
- Use `react-router-dom`'s `useSearchParams` in the catalog page.
- Initialize input state from URL on mount only (`searchParams.get('q') || ''`). Do not sync input back to URL on every render.
- Write debounced value to URL using `setSearchParams` with `replace: true` (avoid adding history entries). This prevents render loops: input controlled locally; URL updated when debounced search changes.
- If debounced value is empty/whitespace, remove `q` param entirely.
- Browser Back restores the term via URL param changes (React Router updates search params).

## Debounced hook
- `useDebouncedValue<T>(value: T, delay: number): T` returns debounced value; updates after `delay` ms since last change. Uses `useEffect` with cleanup to cancel timeout. Handle StrictMode appropriately (no spurious updates).

## Folder layout
- `apps/web/src/features/catalog/`: `CatalogPage.tsx`, `components/SearchBar.tsx` (or inline), `components/ResultsCounter.tsx`, `components/ProductGrid.tsx`, `hooks/useProducts.ts`, `api/getProducts.ts`
- `apps/web/src/shared/components/ProductCard/`: `ProductCard.tsx`, `ProductCard.module.css`, index.ts
- `apps/web/src/shared/utils/format-price.ts` (+ tests)
- `apps/web/src/shared/api/client.ts` (+ tests)
- `apps/web/src/shared/hooks/useDebouncedValue.ts` (+ tests)
- Types from `contracts` package (ProductSummary). Do not duplicate.

## Card borders and hover
- Border technique: cards use `border: 1px solid var(--color-border-card, #000)`; the grid container uses `gap: 0` or cards sit in grid cells with borders. To avoid double borders between adjacent cards, use negative margins or set borders so only internal edges double - simpler: each card has top/left border; or alternatively use `outline`? Better: set `border-top`, `border-left`; then on last column add `border-right`, on last row add `border-bottom` - or just `border: 1px` and rely on grid gap 0 with `margin-right: -1px; margin-bottom: -1px` on items to overlap. Need to ensure last row/col don't create extra visible borders. Also ensure partial rows keep empty slots empty.
- Hover: absolutely positioned pseudo-element `::before` covering card, `transform: translateY(100%)` -> `translateY(0)` on hover/focus-visible; content (`brand/name/price`) sits above with `position: relative; z-index: 1` and color transitions. On leave, reverse. Under `prefers-reduced-motion: reduce`, transitions become `none`/instant.
- Focus: keep global `:focus-visible` outline visible outside card (don't remove it); card link can have its own focus style consistent with hover.

## Status region updates
- Counter is `role="status"`. Its text is set only when a response arrives (not during typing). Track last successful response timestamp/id; update counter when `success && !loading` for current search, or when data changes due to resolved request matching current token. For initial load, show "LOADING..." in status area; for subsequent searches, keep previous counter visible until new response arrives - but requirement says "counter and cards stay on screen until the new response arrives" - update counter only when response arrives.

## Design token additions
Add to `tokens.css`:
- `--color-border-card: #000000;`
- `--color-border-search-underline: #000000;`

Counter typography uses existing tokens where possible (`--font-size-12`, `--font-weight-light`, `Helvetica, Arial, sans-serif` stack). Font specified as "Helvetica Neue" in Figma context - follow existing stack (Helvetica, Arial, sans-serif). Note in design-notes.md if stack differs.

## Search underline
Underline-only: input has no border, `border-bottom: 1px solid var(--color-border-search-underline)`. Native clear button hidden via `input[type="search"]::-webkit-search-cancel-button { display: none }` and equivalent. Hit area >=24px via padding.

## Tests approach
Use `fetch` passed as dependency boundary or global fetch mocked via `jest.spyOn(global, 'fetch')` with controllable responses. Use `userEvent` for typing/clicking. Use `jest.useFakeTimers()` for debounce (advance timers). For stale responses, control response timing. For abort, verify no state updates after abort.

## Interaction with the shell focus behavior
The shell's `useNavigationFocusScroll` originally keyed on `location.key`, so a search-param update (replace) would move focus to `<main>`, stealing focus from the search field on every debounced keystroke. That hook now compares `location.pathname` instead: focus and scroll-to-top only happen on a view change, not on `?q=` updates. This is a behavior refinement of the existing shell, needed for catalog-search; it does not change the "focus moves on navigation" contract.
