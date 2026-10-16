# Design

## Context

See `proposal.md` for motivation, and the delta specs for the required behavior. Constraints that shape the approach:

- The cart state already exists in `apps/web/src/shared/cart`: `useCart` exposes `lines`, `itemCount`, `totalCents`, `addLine` and `removeLine`, and `CartProvider` accepts an injectable `storage` for tests. This change only consumes it.
- `/cart` already renders `features/cart/CartPage` inside `AppLayout`. `AppLayout`'s `<main id="main">` carries no padding, so each view supplies its own (as `ProductView` does).
- Feature isolation (AGENTS.md): a feature may import `shared/`, never another feature. The detail view's `.addButton` / `.retryButton` styles are feature-local and cannot be imported.
- The header is not sticky and is always 80px tall (`--header-height`), so viewport-anchoring math is stable.
- No new dependency is allowed without asking; the existing stack is React 19 + CSS Modules + tokens.

## Goals / Non-Goals

**Goals:**

- Render the cart purely from `useCart`, with no duplicated cart state.
- Keep keyboard focus predictable after a line is removed.
- Anchor the footer to the viewport bottom without overlapping content.
- Reuse the shell padding, tokens, `VisuallyHidden`, `strings` and the shared formatters.

**Non-Goals:**

- Changing cart state, storage, totals or the BFF (out of scope; `cart-state` / `cart-persistence` already cover them).
- Building the header "loading line" (the Figma layer on the cart frame is a loading line, not a divider; deferred).
- Extracting a shared `Button` component or a focus-management utility (see Decisions).

## Decisions

### D1. Focus after removal: per-line ref map + a pending-target ref

Each `CartLine` registers its remove button in a `Map<lineId, HTMLButtonElement>` owned by the page. On removal the page reads the current order, computes the target before dispatching (the next line's `lineId`, else the previous line's, else `none`), stores it in a `pendingFocusRef`, and calls `removeLine`. A `useLayoutEffect` keyed on `lines` then focuses the target button, or the heading when the cart is empty.

- Why this survives re-renders: the ref map is keyed by the stable `lineId`, so it does not depend on DOM order or index; React reuses the surviving line nodes. Computing the target from the pre-removal array avoids index drift after the state update.
- `useLayoutEffect` focuses before paint, so there is no visible focus jump.
- Alternatives rejected: querying `li` by index after render (fragile, order-dependent); `autoFocus` on a line (would steal focus on every mount, including the initial load).

### D2. Footer anchoring: flex column with `min-height` and `margin-top: auto`

The cart page root is a flex column whose `min-height` is `calc(100dvh - var(--header-height))`, with the footer given `margin-top: auto`. Short content pushes the footer to the viewport bottom; tall content grows the column so the footer follows the lines.

- Why not `position: fixed`: a fixed footer leaves the document flow, so it would overlap the last lines (requiring a manual bottom padding) and detach from the page when the user zooms. The flex approach keeps the footer in flow and needs no magic padding.
- `dvh` (dynamic viewport height) accounts for mobile browser chrome; a `100vh` declaration precedes it as a fallback.

### D3. Location and imports: `features/cart`, importing only `shared/`

The view, the line component and the footer live in `apps/web/src/features/cart/`, importing only `shared/` (`cart`, `utils`, `strings`, `components/VisuallyHidden`) and their own CSS module. Button styles are re-declared in `CartPage.module.css`.

- Alternative rejected: promote the detail button styles to `shared/components/Button` now. Only two features use buttons, the cart's outlined variant differs, and AGENTS.md warns against unrequested abstractions; a shared `Button` can be extracted in a dedicated change when a third consumer appears.

### D4. No new dependency

Plain React, CSS Modules and existing tokens cover everything (focus via refs, layout via flex, icons as asset URLs). No focus-management or UI library is added.

### D5. Breakpoints, sizes and new tokens

Mobile-first with the shell breakpoints (600px tablet, 1024px desktop). Both footer buttons share the sizes from the Figma: 175×48 mobile, 200×48 tablet, 260×56 desktop; the outlined button uses a `1px` border in a new token `--color-border-outline: #1B1A18` (distinct from `--color-border-control` `#CCCCCC`) with a white background and a `#000` label, and `PAY` uses `--color-bg-primary` `#000000` with a white label. The total is `14px` weight `400`, so a `--font-weight-regular: 400` token is added (only `--font-weight-light: 300` exists today). The title is `20px` on mobile and tablet and `24px` on desktop.

## Risks / Trade-offs

- Only one removal happens per interaction, so the pending target is always valid; when the cart empties, the effect falls back to the heading, which is why the heading is given `tabindex="-1"`.
- `100dvh` is unsupported in older engines; the preceding `100vh` keeps the layout correct there.
- The cart buttons' letter-spacing (assumed `0.08em`, matching the add button) and the mobile gap between the two buttons are unmeasured and marked `[CONFIRM]` in `docs/design-notes.md`.
- The cart frame's header line is intentionally not built; recorded as out of scope in the design notes and README.
- Each button keeps the browser's default focus ring (the design specifies no focus styling); overriding it away would break the graded accessibility requirement.
