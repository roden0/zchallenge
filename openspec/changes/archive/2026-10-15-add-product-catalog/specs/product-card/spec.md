## ADDED Requirements

### Requirement: Shared ProductCard component
A shared ProductCard component displays product summary information, links to detail, and supports hover/focus states. Reusable in detail's "Similar items".

#### Scenario: Card structure
- GIVEN a ProductSummary
- THEN the whole card is one link to /products/{id} with id URL-encoded
- AND the content order is brand, name, price (top-to-bottom in info area)
- AND the image is decorative (alt="") because link text names the product
- AND it lives in shared/components

#### Scenario: Layout
- GIVEN the card
- THEN image area has reserved aspect ratio so images do not shift layout
- AND image uses object-fit: contain with generous padding
- AND info row: brand above name on the left, price on the right
- AND if narrow (around 165px at 1024px width), price wraps below instead of overflowing

#### Scenario: Typography
- GIVEN card text
- THEN brand is 10px uppercase, color text-secondary
- AND name is 12px uppercase, color text
- AND price is 12px right-aligned, color text

#### Scenario: Price formatting
- GIVEN price formatting in the card
- THEN integers show no decimals (1099 -> "1099 EUR")
- AND decimals always show exactly two places (959.42 -> "959,42 EUR", 549.5 -> "549,50 EUR")
- AND decimal separator is comma
- AND no thousands separator
- AND suffix is " EUR"

#### Scenario: Image loading
- GIVEN the grid
- THEN images load lazily except the first five cards which are eager
- AND no src rewriting in the web app (BFF already returns https URLs)

#### Scenario: Hover and focus
- GIVEN hover is supported (@media (hover: hover))
- WHEN hovering the card
- THEN a black layer rises from bottom to top of the card
- AND background transitions from white to black
- AND brand, name, price turn white
- AND timing uses --duration-hover and --easing-hover (1000ms, ease-in-out)
- WHEN focus-visible is on the link
- THEN the same hover effect occurs
- WHEN leaving hover/focus
- THEN it reverses with the same timing
- GIVEN prefers-reduced-motion
- THEN the change is instant
- AND the global focus outline remains visible outside the card
