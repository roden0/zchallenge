# Tasks

## 1. Verify the starting point

- [x] 1.1 Confirm `useCart` exposes `lines`, `itemCount`, `totalCents` and `removeLine`, and that `CartProvider` accepts an injectable `storage` (read `apps/web/src/shared/cart`). Verify: the exports and prop match.
- [x] 1.2 Confirm `formatPrice` and `formatCapacity` exist in `shared/utils` and `/cart` renders `features/cart/CartPage`. Verify: `pnpm typecheck` passes and `/cart` shows the current placeholder.

## 2. Cart line component and the list

- [x] 2.1 Replace the `CartPage` placeholder with the cart view: an `h1` using `strings.cartTitle(lines.length)` and the line list, both driven by `useCart`. Verify: at `/cart` with lines the heading reads `CART (n)` and one item renders per line.
- [x] 2.2 Add `features/cart/components/CartLine.tsx` rendering the decorative image (`alt=""`), the uppercased name, `{formatCapacity(capacity)} | {color name}` uppercased, `formatPrice(price)`, and the `Eliminar` button at the bottom of the image area. Verify: a line's visible content matches the `cart-lines` line-contents scenarios.
- [x] 2.3 Render the lines as `ul[role="list"]` in insertion order keyed by `lineId` (biome-ignore `lint/a11y/noRedundantRoles`, as the similar-items row does). Verify: two lines with the same configuration render as two independent items.

## 3. Removal, status message and focus management

- [x] 3.1 Wire `removeLine` to the `Eliminar` button and give the button a visually hidden suffix `{name}, {capacity}, {color}` so identical-looking lines are distinguishable. Verify: the remove buttons of two lines for the same phone have different accessible names.
- [x] 3.2 Announce `strings.cartRemovedFromCart(name)` in a visually hidden `role="status"` while the heading and total update in the same render. Verify: removing a line updates the heading and the total and exposes the status text.
- [x] 3.3 Implement focus after removal per `design.md` D1 (per-line ref map plus a pending-target ref applied in `useLayoutEffect`): the next line, the previous line when the last is removed, or the `h1` (`tabIndex={-1}`) when the cart empties. Verify: focus lands on the expected remove button or heading for middle, last and only-line removals.

## 4. Footer, total and the PAY placeholder

- [x] 4.1 Add `features/cart/components/CartFooter.tsx`: the outlined `CONTINUE SHOPPING` link to `/`, the `TOTAL` row using `formatPrice(totalCents)`, and the dark `PAY` button (desktop 260×56, tablet 200×48, mobile 175×48). Verify: the link points to `/` and 959.42 + 117.29 shows `1076,71 EUR`.
- [x] 4.2 Make `PAY` a `type="button"` placeholder that reveals `strings.cartCheckoutUnavailable` in a `role="status"` under the footer and does not navigate. Verify: activating `PAY` shows the text and the URL is unchanged.
- [x] 4.3 Implement the footer arrangement (desktop and tablet: `CONTINUE SHOPPING` left, total and `PAY` right; mobile: total on its own row above two equal-width buttons) and the footer anchoring from `design.md` D2. Verify: at 393px and 1920px the arrangement matches and the footer never overlaps the lines.

## 5. Empty state and layout at the three widths

- [x] 5.1 Render the empty state: `CART (0)` and the `CONTINUE SHOPPING` link only, spanning the full width on mobile; no list, total or `PAY`. Verify: an empty cart shows exactly the heading and the link.
- [x] 5.2 Apply the shell page padding, the responsive title (20px mobile and tablet, 24px desktop), the 12px line text, the 14px/400 total, and add `--color-border-outline` and `--font-weight-regular` to `styles/tokens.css`. Verify: no horizontal scroll at 393px, 834px or 1920px and the computed styles match the recorded values.
- [x] 5.3 Set the document title to `Cart | MBST` via `usePageTitle`. Verify: the tab title reads `Cart | MBST`.

## 6. Tests

- [x] 6.1 Add `features/cart/CartPage.test.tsx` (Jest + RTL, `userEvent`), rendering `CartPage` inside `CartProvider storage={...}` and `MemoryRouter`, covering: heading count; line image `alt=""`, name, options and price; distinct remove names for two lines of the same phone; removal updating the line, heading, total and status; focus after removing the first, a middle, the last and the only line; 959.42 + 117.29 showing `1076,71 EUR`; the same configuration twice removing only one; empty cart; the link to `/`; `PAY` showing the status text without navigating; lines rendered from stored state after a remount; and the document title. Verify: `pnpm test` (web) passes with no console output asserted away.

## 7. Update documentation

- [x] 7.1 Record the confirmed cart values in `docs/design-notes.md` (outlined-button `1px #1B1A18` with white background and no hover/focus styling; title 20px mobile and tablet and 24px desktop; line text 12px; total 14px/400 on one line and above the buttons on mobile; button sizes 260×56 / 200×48 / 175×48; the header line is a loading line and is out of scope), and add the approximate desktop spacing marked `[CONFIRM]` that the `cart-layout` spec lists. Verify: confirmed values appear without `[CONFIRM]`, measured values with it.
- [x] 7.2 Update the README cart section: describe the view and list `PAY`/checkout as out of scope. Verify: the README states the placeholder is out of scope.

## 8. Final verification

- [x] 8.1 Run `pnpm lint`, `pnpm typecheck` and `pnpm test`; all pass. Verify: the three commands exit 0.
- [x] 8.2 With the app running, add two different configurations from the detail view (XIA-R12, which has decimals, and SMG-S24U), open `/cart` at 393px, 834px and 1920px, check the total, remove each line with the keyboard and watch where focus lands, reload to check persistence, activate `PAY`, and confirm an empty console in dev and in the production build (`pnpm build` then `pnpm start`). Verify: the observed behavior matches the specs and the console is empty in both modes.

## Workflow follow-up

- Archive the change after the repository's review requirements are satisfied.
