# Proposal

## Why

The `/products/:id` route renders a placeholder while the graded challenge requires a full product detail view: data loading with proper states, color/storage selection with dynamic price and image, specifications, and adding the chosen configuration to the cart. The catalog and cart are done; the detail view is the missing link between them.

## What Changes

- The detail view fetches `GET /api/products/{id}` (URL-encoded) through the BFF and renders loading, not-found, error-with-retry, and success states with the specified document titles.
- New responsive detail layout: `< BACK` link, product name `h1`, large color-driven image on the left, info column (title, price, selectors, add button) on the right, and a real specifications table.
- Storage and color become native radio groups (fieldset/legend, visually hidden inputs, styled labels) with nothing auto-selected, a shared price that follows the selected storage, an image/alt that follow the selected color, and hexCode validation for swatches.
- "AÑADIR" stays natively disabled until both a storage and a color are chosen; activating it appends a cart line through the existing `useCart().addLine` and announces the addition to assistive tech.
- Two small shared utilities: `formatCapacity` (space-normalize capacity text) and a hexCode validator.
- Two confirmed design tokens are added (`--color-bg-primary`, `--color-border-selected`) and the confirmed detail-view values are recorded in `docs/design-notes.md`.

Out of scope for this change: similar items, cart view, quantity, wishlist, image zoom or gallery, price revalidation, SSR.

## Capabilities

### New Capabilities

- `product-detail-data`: fetching the product detail, loading/not-found/error states with retry, document titles, and request cancellation when the id changes.
- `product-detail-layout`: back link, product heading, responsive image/info arrangement, color-driven image with stable aspect ratio, and the specifications table.
- `product-options`: storage and color radio groups — selection rules, capacity normalization, swatch rendering with hexCode validation, and products without options.
- `product-price`: price display before and after a storage selection, always via the shared formatter, never affected by color.
- `product-add-to-cart`: enablement rules, accessible hint, the line payload passed to the cart, repeat additions, and post-add feedback.

### Modified Capabilities

None. Existing specs (`app-routing`, `app-header`, `design-tokens`, `bff-product-detail`, `product-card`, `cart-state`, `api-client`) keep their requirements; this change satisfies them rather than changing them.

## Impact

- `apps/web/src/features/product-detail/`: `ProductDetailPage.tsx` replaced in place, plus `api/getProduct.ts`, `hooks/useProduct.ts`, components and CSS Modules.
- `apps/web/src/shared/`: `utils/format-capacity.ts`, `utils/hex-code.ts` (with tests), new strings in `shared/strings.ts`, two new tokens in `styles/tokens.css`.
- Reused unchanged: `shared/api/client.ts` (`apiFetch`/`ApiError`), `shared/utils/format-price.ts`, `VisuallyHidden`, `usePageTitle`, `useCart().addLine`, `contracts.ProductDetail`.
- BFF: no change (route, validation and error mapping already exist and are tested).
- Tooling, shell and catalog: no change.
- Dependencies: none added.
