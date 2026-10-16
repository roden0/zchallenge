# Tasks: add-cart-state

## 1. Verify starting point

- [x] 1.1 Confirm `Header` accepts `itemCount` and `AppLayout` passes `0`, that `formatPrice` and the contracts types exist, and that `openspec/changes/add-cart-state/` is scaffolded; report anything unexpected and STOP if a claim fails (verify: findings reported against `Header.tsx`, `AppLayout.tsx`, `shared/utils/format-price.ts`, `packages/contracts/src/index.d.ts`).

## 2. Types and pure helpers

- [x] 2.1 Create `apps/web/src/shared/cart/types.ts` with `CartLine`, `CartState` and the cart action types exactly as specced (verify: `pnpm typecheck` passes).
- [x] 2.2 Create `apps/web/src/shared/cart/cart-storage.ts` pure core: `isCartLine` guard, `parseCart`, `serializeCart` (verify: parse tests below pass).
- [x] 2.3 Create the totals helper (`totalCents` over `Math.round(price * 100)`) and tests: itemCount from lines, `959.42 + 117.29` gives `107671`, empty cart gives `0` (verify: `pnpm test` green for these).
- [x] 2.4 Write parse tests: valid value, invalid JSON, wrong version, non-object, one invalid line dropped and the rest kept, repeated lineId keeps first, negative or NaN price dropped, missing/empty field dropped (verify: all cases pass).

## 3. Reducer

- [x] 3.1 Create `apps/web/src/shared/cart/cart-reducer.ts`: pure exported reducer with `add` (complete line), `remove` (by lineId, unknown id returns the same state reference), `replace` (validated list) (verify: `pnpm typecheck` passes).
- [x] 3.2 Write reducer tests: add, identical configuration twice gives two lines, insertion order kept, remove, unknown id keeps the same state reference, previous state never mutated (verify: `pnpm test` green).

## 4. Storage module

- [x] 4.1 Add the safe wrapper `readCart`/`writeCart` to `cart-storage.ts`: every storage access in try/catch, default `window.localStorage` resolved inside the try, injectable `StorageLike` (verify: `pnpm typecheck` passes).
- [x] 4.2 Write storage-module tests with fake storages: round trip read/write, read that throws returns an empty cart, write that throws is swallowed, nothing printed to the console (spy on `console.*` and assert not called) (verify: `pnpm test` green).

## 5. Provider and useCart

- [x] 5.1 Create `apps/web/src/shared/cart/CartProvider.tsx`: lazy `useReducer` initializer reading storage synchronously, lineId generation in `addLine` (`crypto.randomUUID` with documented fallback + collision check), write effect with change detection, `storage` event listener (key filter, validate, `replace`, ref update), `storage` prop injection (verify: `pnpm typecheck` passes).
- [x] 5.2 Create `apps/web/src/shared/cart/useCart.ts` throwing a clear error outside the provider, plus a `shared/cart/index.ts` barrel (verify: unit test for the throw passes).
- [x] 5.3 Create `apps/web/src/app/providers.tsx` and mount it in `router.tsx` around `<Routes>` (verify: existing Routing/Landmarks/Navigation/Titles/SkipLink/CatalogPage tests still pass unchanged).
- [x] 5.4 Write provider tests: initial state from storage on the first render, writes after add and remove, storage that throws on read and on write does not break the app and prints nothing, `useCart` outside the provider throws (verify: `pnpm test` green).

## 6. Header count wiring

- [x] 6.1 Replace the hard-coded `0` in `AppLayout.tsx` with `itemCount` from `useCart` (verify: `pnpm lint`, `pnpm typecheck` and the existing `Header.test.tsx` count/icon/aria tests all pass).

## 7. Integration tests

- [x] 7.1 Write the header integration test: render the layout inside the provider, add a line, assert the badge and the active icon follow the cart state (verify: test passes).
- [x] 7.2 Write cross-tab tests: a `StorageEvent` for `mbst:cart:v1` replaces the state, one for another key is ignored, a removed key gives an empty cart (verify: `pnpm test` green).

## 8. Documentation

- [x] 8.1 Update `docs/design-notes.md`: move "Cart without quantities" from Proposed to Decisions resolved and note cents-based totals and the storage key (verify: the bullet no longer appears under "Proposed").
- [x] 8.2 Update `docs/api-notes.md`: the cart line behavior is no longer awaiting confirmation; integer-cent totals are decided (verify: "still needs confirmation" is gone).
- [x] 8.3 Update `README.md`: cart persistence key and the known limitation that cart prices are snapshots, never revalidated against the API (verify: section present and accurate).

## 9. Final verification

- [x] 9.1 `pnpm lint`, `pnpm typecheck`, `pnpm test` all pass (verify: commands exit 0).
- [x] 9.2 Manual browser check: temporary dev-only harness calls `addLine` (not committed), header count and icon change, reload persists, second tab syncs, hand-corrupted stored value starts with an empty cart, console empty throughout; remove the harness afterwards and re-run `pnpm test` + `pnpm lint` (verify: harness gone from the diff, checks green, console clean).
