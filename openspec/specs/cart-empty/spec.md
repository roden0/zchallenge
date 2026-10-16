# cart-empty Specification

## Purpose
Defines what the cart view shows when there is nothing in it, so the empty cart stays minimal and still offers a way back to the catalog.

## Requirements

### Requirement: Empty cart content

With no lines, the cart SHALL show only the `CART (0)` heading and the `CONTINUE SHOPPING` link, with no list, total or `PAY` button; on mobile the link SHALL span the full content width.

#### Scenario: Nothing in the cart

- **WHEN** the cart has no lines
- **THEN** the heading reads `CART (0)` and the `CONTINUE SHOPPING` link is shown

#### Scenario: No list, total or pay

- **WHEN** the cart has no lines
- **THEN** no line list, no total and no `PAY` button are rendered

#### Scenario: Full-width link on mobile

- **WHEN** the viewport is 393px wide and the cart is empty
- **THEN** the `CONTINUE SHOPPING` link spans the full content width
