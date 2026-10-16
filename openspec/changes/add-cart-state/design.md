# Design

## Context

See proposal.md - Why. The shell already exists: `Header` takes `itemCount` (default `0`), `AppLayout.tsx` passes a literal `0`, and `docs/design-notes.md` proposes cart-without-quantities (line per add, `lineId`, header count = lines). StrictMode is on (`main.tsx`). There are no providers yet; `App.tsx` is just the router. Six test files render `AppRoutes` directly (Routing, Landmarks, Navigation, Titles, SkipLink, CatalogPage). Contracts live in `packages/contracts` (`storage.price` is absolute, colors carry `hexCode`, prices are floats with decimals).

## Goals / Non-Goals

**Goals:** One app-wide cart source of truth that survives reloads, syncs across tabs, keeps the header count honest, and is fully testable without patching globals.

**Non-Goals:** Cart view, add button, product detail wiring, quantity, price revalidation, checkout, server-side cart, new dependencies, tooling changes.

## Decisions

### D1. Placement: `shared/cart`, not `features/cart`
The consumers are the header (in `app/`), the product detail view and the cart view (both in `features/`). A feature may never import another feature, so the provider, reducer, storage module and hook live in `apps/web/src/shared/cart/`; `features/cart` keeps only the future cart view. `shared/` is the only place all three can reach.

### D2. Provider wiring: `app/providers.tsx`, mounted inside `AppRoutes`
`AppProviders` (currently just `CartProvider`; the seam for future providers) wraps `<Routes>` in `router.tsx`. Everything under `AppLayout` - production and the six existing tests that render `AppRoutes` - is then inside the provider with zero test churn. Alternative: mount in `App.tsx` around `<AppRouter/>`, which would require wrapping six test files for no benefit. `useCart` throwing outside the provider keeps the failure loud.

### D3. One context, not split state/actions contexts
A single context whose value is memoized on `lines` (`{ lines, itemCount, totalCents, addLine, removeLine }`). Every consumer derives from `lines` anyway; splitting into two contexts adds a second provider and re-render plumbing for a state this small. Revisit only if a future consumer must re-render on actions alone.

### D4. Cart storage module: pure core + safe wrapper, injectable storage
`shared/cart/cart-storage.ts`:
- Pure: `isCartLine(value): value is CartLine`, `parseCart(raw): CartLine[]` (validation-on-read: invalid JSON / non-object / wrong version -> `[]`; per-line guard, invalid lines dropped, first duplicate `lineId` kept), `serializeCart(lines): string` (deterministic: `JSON.stringify({ version: 1, lines })`, stable key and line order).
- Safe: `readCart(storage?)` / `writeCart(storage?, lines)` wrap every access in try/catch and resolve the default `window.localStorage` lazily inside the try (accessing the property itself can throw in private mode). `StorageLike = { getItem; setItem }` is injected through a `<CartProvider storage>` prop, so tests simulate quota/read failures with fakes instead of patching globals. Nothing is ever logged.

### D5. Lazy initializer and React StrictMode
`useReducer(reducer, undefined, initCart)` where `initCart` reads storage synchronously on the first render - no `0` flash for returning visitors. The initializer and the reducer are pure (the initializer only reads what it is given), so StrictMode's double invocation is harmless; writes happen in an effect, never in the reducer.

### D6. lineId is created outside the reducer
The reducer must stay pure, so id generation lives in `addLine`: `crypto.randomUUID()` when available, otherwise the documented fallback `Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)` (timestamp + random base-36), regenerated while it collides with an id already in the cart. The provider passes a complete line to the reducer.

### D7. Totals in integer cents
`totalCents = sum of Math.round(price * 100)` per line; euros = `totalCents / 100`. 959.42 + 117.29 -> 95942 + 11729 = 107671 -> 1076.71 exactly. No floats summed, no dependency. `itemCount` is `lines.length`.

### D8. Write loop prevention across tabs
Serialization is deterministic (D4), and the write effect keeps a ref seeded with `serializeCart(initialLines)`:
- If the stored string already matches, nothing is written on mount (a normalized stored value round-trips to itself; a corrupt or foreign-key-order value gets one normalizing write, which is desirable).
- On each state change the effect writes only when the serialized string differs from the ref, then updates the ref.
- A `storage` event for the key sets the ref to the incoming serialized value before dispatching `replace`, so the receiving tab never writes the same bytes back. Identical writes are skipped by the ref, so two tabs converge and settle regardless of whether the browser fires events for no-op writes.

### D9. No new dependency, no tooling change
Context, `useReducer`, `localStorage` and `StorageEvent` are platform/React. The openspec CLI was installed globally (outside the repo) per human choice; the repo's toolchain is untouched.

## Risks / Trade-offs

- Stored prices are snapshots and can go stale vs the API → accepted limitation, documented in the README (price revalidation is out of scope).
- `storage` events only fire for `window.localStorage`; an injected `StorageLike` is for reads/writes in tests → tests dispatch synthetic `StorageEvent`s on `window`, which matches production wiring.
- Pre-existing conflicts left untouched (out of scope): `app-header` spec says the header is sticky while `docs/design-notes.md` records the human decision that it is not; `formatPrice` always prints two decimals while the docs propose decimals-only-when-present.
- `crypto.randomUUID` availability depends on the runtime/jsdom → documented fallback (D6) keeps behavior identical.

## Open Questions

None - specs, approach and task breakdown are settled.
