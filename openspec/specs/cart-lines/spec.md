# cart-lines Specification

## Purpose
Shows every configuration the user added as its own removable cart line, keeps the visible count and total in step with the lines, and announces changes to assistive technology.

## Requirements

### Requirement: Cart heading shows the line count

The cart view SHALL render a top-level heading with the exact text `CART ({n})`, where `{n}` is the number of cart lines, so the heading always reflects the current count.

#### Scenario: Non-empty cart

- **WHEN** the cart holds two lines
- **THEN** the cart heading reads `CART (2)`

#### Scenario: Count follows removal

- **WHEN** one line is removed so one line remains
- **THEN** the cart heading reads `CART (1)`

### Requirement: Lines are a list in insertion order

The cart view SHALL present the cart lines as a list with the list role, in insertion order, one item per stored line, and each line SHALL be independently identifiable so identical configurations stay separate.

#### Scenario: Insertion order

- **WHEN** two lines are added in the order A then B
- **THEN** the list shows A before B

#### Scenario: Same configuration added twice

- **WHEN** the same product with the same storage and color is added twice
- **THEN** the list shows two separate items

### Requirement: Cart line contents

Each cart line SHALL show the stored image as a decorative image, the product name uppercased, an options line of `{capacity} | {color name}` uppercased, and the line price produced by the shared price formatter.

#### Scenario: Image, name, options and price

- **WHEN** a line stores image `img.webp`, name `iPhone 15 Pro`, capacity `256 GB`, color `Black` and price `959.42`
- **THEN** the line shows a decorative image (`alt=""`), the text `IPHONE 15 PRO`, the text `256 GB | BLACK` and the text `959,42 EUR`

#### Scenario: Capacity is normalized

- **WHEN** a line stores the raw capacity `128GB`
- **THEN** the options line shows `128 GB` before the separator

#### Scenario: Image is decorative

- **WHEN** a line is shown
- **THEN** its image has an empty `alt` attribute

### Requirement: Remove control is labelled per line

Each cart line SHALL provide a remove button whose visible label is `Eliminar` and whose accessible name also contains that line's product name, normalized capacity and color name, so lines that look identical are distinguishable.

#### Scenario: Visible label

- **WHEN** a line is shown
- **THEN** its remove button shows the text `Eliminar`

#### Scenario: Distinct names for identical phones

- **WHEN** two lines hold the same phone in different colors
- **THEN** each remove button's accessible name contains `Eliminar` followed by that line's name, capacity and color

#### Scenario: Remove button placement

- **WHEN** a line is shown
- **THEN** the remove button sits at the bottom of the details column, to the right of the image

### Requirement: Removing a line

Removing a line SHALL delete only that line; the heading and the total SHALL update together, and a visually hidden status message `{name} removed from cart.` SHALL be announced.

#### Scenario: Remove one of several lines

- **WHEN** the cart holds `iPhone 15 Pro` and another line, and the `iPhone 15 Pro` line is removed
- **THEN** only that line disappears, the heading count and the total exclude it, and a status region announces `iPhone 15 Pro removed from cart.`

### Requirement: Focus after removal

After a line is removed, focus SHALL move to the remove button of the line that took its place, that is the next line, or the previous line when the last line was removed; when the cart becomes empty, focus SHALL move to the cart heading, which is programmatically focusable.

#### Scenario: Removing a non-last line

- **WHEN** a line that is not the last is removed while others remain
- **THEN** focus is on the remove button of the line that shifted into its position

#### Scenario: Removing the last line

- **WHEN** the last line is removed while earlier lines remain
- **THEN** focus is on the remove button of the previous line

#### Scenario: Removing the only line

- **WHEN** the only line is removed
- **THEN** focus is on the cart heading

### Requirement: Lines survive a reload

The cart view SHALL render its lines from the persisted cart state so they survive a page reload.

#### Scenario: Reload keeps the lines

- **WHEN** lines were added and the view is loaded again from persisted state
- **THEN** the same lines are shown
