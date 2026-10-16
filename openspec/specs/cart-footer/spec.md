# cart-footer Specification

## Purpose
Gives the cart its footer: a way to return to the catalog, a visible order total, and a placeholder pay action, arranged for each supported width and anchored to the bottom of the viewport.

## Requirements

### Requirement: Continue shopping link

The footer SHALL show a `CONTINUE SHOPPING` control that is a link to the catalog root `/`, styled as the outlined button.

#### Scenario: Link target

- **WHEN** the footer is shown
- **THEN** there is a link named `CONTINUE SHOPPING` whose destination is `/`

### Requirement: Order total

When the cart has at least one line, the footer SHALL show a `TOTAL` label and the line prices summed in integer cents and formatted by the shared price formatter.

#### Scenario: Total with decimals

- **WHEN** the lines are priced `959.42` and `117.29`
- **THEN** the footer shows `1076,71 EUR`

#### Scenario: No total when empty

- **WHEN** the cart has no lines
- **THEN** no total is shown

### Requirement: Placeholder pay action

When the cart has at least one line, the footer SHALL show a dark `PAY` button; activating it SHALL not navigate and SHALL reveal the status text `CHECKOUT IS NOT AVAILABLE IN THIS DEMO.` under the footer.

#### Scenario: Activating PAY

- **WHEN** the user activates `PAY`
- **THEN** the text `CHECKOUT IS NOT AVAILABLE IN THIS DEMO.` is announced in a status region and the view does not navigate

### Requirement: Footer arrangement per width

On desktop and tablet the footer SHALL place `CONTINUE SHOPPING` on the left and the total and `PAY` on the right; on mobile the total SHALL occupy its own row above the two buttons, which SHALL sit side by side with equal width.

#### Scenario: Desktop arrangement

- **WHEN** the viewport is 1920px wide
- **THEN** `CONTINUE SHOPPING` is on the left and the total and `PAY` are together on the right

#### Scenario: Mobile arrangement

- **WHEN** the viewport is 393px wide
- **THEN** the total is on its own row above two buttons of equal width

### Requirement: Footer stays below the lines

The footer SHALL sit at the bottom of the viewport when the content is shorter than the viewport, and SHALL move down with the content when it is longer, never overlapping the lines.

#### Scenario: Short content

- **WHEN** the lines do not fill the viewport
- **THEN** the footer sits at the bottom of the viewport

#### Scenario: Long content

- **WHEN** the lines exceed the viewport height
- **THEN** the footer follows the content below the lines and never overlaps them
