# similar-items-section Specification

## Purpose

Defines the `SIMILAR ITEMS` section at the bottom of the product detail view: its heading and the horizontally scrolling row of product cards, when it is shown, how the cards are sized and laid out, the scrollbar, and how it reuses the catalog card.

## ADDED Requirements

### Requirement: Section and heading
When the product has at least one similar product, the view MUST render a section with an `h2` whose accessible text is `SIMILAR ITEMS`, followed by the row of cards.

#### Scenario: Heading present
- **WHEN** a loaded product has similar products
- **THEN** an `h2` with the text `SIMILAR ITEMS` is shown below the specifications section

#### Scenario: Heading level
- **WHEN** the section is present
- **THEN** its title is an `h2` (not the `h1` and not a heading that skips a level)

### Requirement: One card per similar product in order
The section MUST render exactly one card per entry of `similarProducts`, in the order returned by the response, and MUST NOT render a card for the product currently shown.

#### Scenario: Order and count
- **WHEN** the response lists the similar products `A`, `B`, `C` in that order
- **THEN** three cards are shown in the order `A`, `B`, `C`

#### Scenario: Current product absent
- **WHEN** the similar products do not include the product currently shown
- **THEN** no card links to the current product's own id

### Requirement: Hidden when empty
When `similarProducts` is empty the section MUST NOT be rendered at all - neither the heading nor the row.

#### Scenario: Empty list
- **WHEN** the loaded product has no similar products
- **THEN** no `SIMILAR ITEMS` heading and no similar-items row are present

### Requirement: Horizontal scrolling row
The cards MUST sit in a single horizontally scrolling row. The page itself MUST NOT scroll horizontally; only the row does.

#### Scenario: Row scrolls, page does not
- **WHEN** the row content is wider than the viewport
- **THEN** the row scrolls horizontally within its own area
- **AND** the page has no horizontal scrollbar

### Requirement: Card width matches the catalog
Each card MUST use the same width as a catalog card at the same breakpoint: about `344px` on desktop, the two-column width on tablet, and close to the full content width on mobile, so the next card peeks at the right edge. Cards MUST NOT be squeezed to fit.

#### Scenario: Desktop width
- **WHEN** the viewport is `1920px` wide
- **THEN** each card is about `344px` wide and a further card is partially visible at the right edge

#### Scenario: Mobile width
- **WHEN** the viewport is `393px` wide
- **THEN** a card is close to the full content width and a further card is partially visible at the right edge

### Requirement: Container-aligned start, viewport-right bleed
The row MUST start at the left edge of the detail content (the centered `1200px` container on desktop, the page padding on tablet and mobile) and MUST extend to the right edge of the viewport.

#### Scenario: Desktop alignment
- **WHEN** the viewport is `1920px` wide
- **THEN** the row starts at the left edge of the centered `1200px` content container
- **AND** its right edge reaches the right edge of the viewport

#### Scenario: Tablet and mobile alignment
- **WHEN** the viewport is `834px` or `393px` wide
- **THEN** the row starts at the page padding on that side

### Requirement: Spacing around the section
On desktop there MUST be roughly `150px` between the specifications table and the `SIMILAR ITEMS` title, and roughly `45px` between the title and the cards.

#### Scenario: Desktop spacing
- **WHEN** the viewport is `1920px` wide
- **THEN** the gap above the title is about `150px` and the gap below it about `45px`

### Requirement: Native scrollbar styling
The row MUST use native scrollbar styling - a thin horizontal scrollbar with a dark thumb on a light track - rather than a custom-built scrollbar.

#### Scenario: Scrollbar visible
- **WHEN** the row scrolls horizontally
- **THEN** a thin horizontal scrollbar with a dark thumb and a light track is shown under the row, separated from the cards by a small gap (the cards never touch the scrollbar)

### Requirement: Image loading
The first three cards MAY load their image eagerly; every later card MUST load its image lazily.

#### Scenario: First three eager
- **WHEN** the row renders five or more cards
- **THEN** the images of the first three cards are eager
- **AND** the images of the remaining cards are lazy

### Requirement: Reuse of the catalog card
Each card MUST behave and appear as a catalog card: the same structure, typography, price formatting, decorative image, and the same hover and focus treatment.

#### Scenario: Same card behavior
- **WHEN** a similar-items card is hovered or focused
- **THEN** it shows the same black rising fill and white text as a catalog card
