## MODIFIED Requirements

### Requirement: Cart link and count
The right side shows a link to `/cart` with the bag icon and item count. The count MUST come from the cart state: the layout MUST read it with the cart hook and pass it to the header, so it always shows the current number of cart lines and updates immediately when lines change, including changes made in another tab.

#### Scenario: Cart link points to cart
- **WHEN** on any route
- **THEN** the cart link's `href` is `/cart`

#### Scenario: Cart accessible name
- **WHEN** `itemCount` is `0`
- **THEN** the cart link's accessible name is "Cart, 0 items"

#### Scenario: Cart accessible name singular
- **WHEN** `itemCount` is `1`
- **THEN** the cart link's accessible name is "Cart, 1 item"

#### Scenario: Cart accessible name plural
- **WHEN** `itemCount` is `3`
- **THEN** the cart link's accessible name is "Cart, 3 items"

#### Scenario: Bag icon decorative
- **WHEN** on any route
- **THEN** the bag icon has `alt=""`

#### Scenario: Count follows cart changes
- **GIVEN** the cart has 0 lines
- **WHEN** a line is added in this tab
- **THEN** the visible count changes to `1` without reloading
- **AND** the active bag icon is shown

#### Scenario: Count follows another tab
- **GIVEN** two open tabs sharing the cart
- **WHEN** the cart changes in the other tab
- **THEN** this tab's count and bag icon update to match
