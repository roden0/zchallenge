# Proposal

## Why

`/cart` currently renders a `Cart` placeholder even though the cart state, persistence and the add-to-cart flow are already in place. The challenge needs the real cart view: the list of added configurations, individual removal, the total and the continue/checkout footer.

## What Changes

- Replace the `CartPage` placeholder with the working cart view.
- List every added configuration as its own removable line (image, name, options, price) with a red `Eliminar` button.
- Show the live heading count, a status announcement on removal, and move focus to a sensible target afterwards.
- Add the footer: an outlined `CONTINUE SHOPPING` link to `/`, a same-line `TOTAL {price} EUR` and a dark placeholder `PAY` button; the footer sits at the viewport bottom and moves down with long content.
- Add the empty state (`CART (0)` + the continue link only).
- Add the cart's confirmed typography, button sizes, colors and the measured `[CONFIRM]` desktop spacing; document `PAY`/checkout as out of scope.
- No changes to the cart state, the BFF, the catalog or the detail view.

## Capabilities

### New Capabilities

- `cart-lines`: the cart heading count, the line list and its contents, the per-line remove control, removal behavior, the removal status message and focus-after-removal.
- `cart-footer`: the continue-shopping link, the order total, the placeholder `PAY` action, and the footer's per-width arrangement and bottom-anchored position.
- `cart-empty`: the empty-cart content (heading and continue link only).
- `cart-layout`: the shell page padding, the responsive typography reaches, the document title and the absence of horizontal scrolling at the supported widths.

### Modified Capabilities

<!-- None: cart-state and cart-persistence already cover the state and storage behavior, which this change only consumes. -->

## Impact

- Code: `apps/web/src/features/cart/` (view, line and footer components, CSS module, tests), `shared/strings.ts`, `styles/tokens.css`.
- Docs: `docs/design-notes.md`, `README.md`.
- No API, BFF, routing or dependency changes. Existing `cart-state`, `cart-persistence`, `cart-totals` and the shared formatters are reused as-is.
