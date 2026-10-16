# Proposal

## Why

The header already renders a cart badge from an `itemCount` prop, but nothing behind it exists: the layout passes a hard-coded `0` and there is no app-wide cart state. Before the cart view and the add-to-cart button arrive, the cart itself must exist: one source of truth for lines, totals, persistence and the header count.

## What Changes

- Add cart state in `apps/web/src/shared/cart/`: a pure, exported reducer (`add`, `remove`, `replace`), derived values (`itemCount`, `totalCents` in integer cents), a `CartProvider` and a `useCart` hook.
- Persist the cart in `localStorage` under `mbst:cart:v1` with validation on read, safe try/catch access, write-after-change in an effect, and cross-tab sync via `storage` events.
- Wire the header: the layout passes `itemCount` from `useCart` instead of `0`, so the badge and bag icon follow the real cart immediately, including changes made in another tab.
- Update docs: cart line behavior moves from "proposed" to decided, and the README records that cart prices are snapshots that are never revalidated against the API.

## Capabilities

### New Capabilities

- `cart-state`: cart lines and the pure reducer (add/remove/replace, ordering, duplicate lines), derived values (itemCount, totalCents), lineId creation and uniqueness, and the `useCart` contract.
- `cart-persistence`: the storage format (`mbst:cart:v1`, version 1), synchronous first read, validation of untrusted stored data, write-after-change, failure containment, and cross-tab synchronization.

### Modified Capabilities

- `app-header`: the "Cart link and count" requirement — the count no longer comes from a prop defaulted to `0`, it comes from the cart state and updates live (including cross-tab). Icon rule and accessible names are unchanged.

## Impact

- Affected code: `apps/web/src/shared/cart/` (new), `apps/web/src/app/providers.tsx` (new), `apps/web/src/app/router.tsx`, `apps/web/src/app/layout/AppLayout.tsx`, plus tests for all of them.
- Affected docs: `docs/design-notes.md`, `docs/api-notes.md`, `README.md`.
- No repo tooling changes, no BFF changes, no new dependencies, no product detail or cart view code.
