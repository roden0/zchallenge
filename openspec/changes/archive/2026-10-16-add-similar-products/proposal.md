# Proposal

## Why

The graded detail view is missing its `SIMILAR ITEMS` section: the horizontally
scrolling row of product cards described in `docs/design-notes.md` and named in
`AGENTS.md`. The detail response already carries `similarProducts` (BFF-cleaned)
and the shared `ProductCard` already matches the catalog, so the row can be
added on top of the existing detail view.

## What Changes

- Add a `SIMILAR ITEMS` section at the bottom of the product detail view: an
  `h2` and a horizontally scrolling row of `ProductCard`, one per entry of
  `similarProducts` in the order returned, aligned with the `1200px` content
  container on desktop (page padding on tablet/mobile) and bleeding to the
  right edge of the viewport.
- Hide the whole section (title included) when `similarProducts` is empty.
- Native scrollbar styling: dark thumb, light track, thin.
- Only the first three cards eager; the rest lazy; same hover and focus as the
  catalog.
- Card navigation reuses the existing SPA behavior: the detail view switches to
  the new product (data, image, selections reset), the page scrolls to top and
  focus moves to the main region; browser Back returns to the previous product.

No BFF change and no new dependency.

## Capabilities

### New Capabilities
- `similar-items-section`: the `SIMILAR ITEMS` heading and the horizontally
  scrolling card row on the detail view - presence, ordering, hidden-when-empty,
  card width and bleed layout, scrollbar, image loading and reuse of the catalog
  card's hover/focus.
- `similar-items-navigation`: navigating from a similar-items card to another
  product - client-side route change, scroll/focus, Back, and keyboard reach.

### Modified Capabilities
- none

## Impact

- `apps/web/src/features/product-detail/`: new `components/SimilarProducts` plus
  a render call in `ProductView.tsx` and shared styles.
- `apps/web/src/shared/strings.ts`: one new heading string.
- `docs/design-notes.md`: record the scrollbar values and the section spacing.
- Reuses `shared/components/ProductCard` (already specced for reuse here) and the
  existing shell navigation focus/scroll. No API, BFF, or dependency changes.
