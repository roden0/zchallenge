## Why
The catalog view at `/` must be fully functional: a live search with a results counter and a grid of product cards from the BFF, with loading, empty, and error states. It replaces the catalog placeholder. This builds on the existing app shell and uses the BFF `/api/products` endpoint with the contracts package.

## What Changes
- Add typed utilities: `formatPrice` and typed API client in `shared/`.
- Add debounced value hook and catalog data hook.
- Add `ProductCard` shared component with hover/focus states and responsive behavior.
- Implement catalog page (`features/catalog`) with search (underline-only), counter, grid, loading/empty/error states, URL sync via `?q=`, and abort/ignore stale responses.
- Update design tokens and design notes with confirmed values.

## Impact
- Affects: `apps/web/src/shared/*`, `apps/web/src/features/catalog/*`, `apps/web/src/styles/tokens.css`, `docs/design-notes.md`
- No tooling changes, no BFF changes, no changes to shell except potentially minimal wiring if needed (none expected). No new dependencies.

## Out of Scope
Product detail, similar items, cart, header count, pagination/load more, sorting, other filters, SSR, image optimization, virtualization.
