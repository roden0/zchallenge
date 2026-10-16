# product-add-to-cart Specification

## Purpose

Defines the add-to-cart control of the detail view: its label and size, when it is enabled, the accessible hint, the cart line it adds, repeat additions, and the feedback after adding.

## ADDED Requirements

### Requirement: Add button
The button's label MUST be `AÑADIR`, it MUST fill the width of the info column, and it MUST be `56px` high.

#### Scenario: Label and size
- **WHEN** the product is loaded
- **THEN** the button shows `AÑADIR`
- **AND** it fills the info column width and is `56px` high

### Requirement: Enabled only with both selections
The button MUST be natively disabled until both a storage option and a color are selected, and MUST become enabled as soon as both are.

#### Scenario: Initially disabled
- **WHEN** the view loads with nothing selected
- **THEN** the add button is disabled

#### Scenario: Storage only
- **WHEN** only a storage option is selected
- **THEN** the add button is disabled

#### Scenario: Color only
- **WHEN** only a color is selected
- **THEN** the add button is disabled

#### Scenario: Both selected
- **WHEN** a storage option and a color are selected
- **THEN** the add button is enabled

### Requirement: Accessible hint
A visually hidden hint with the text `Select a storage and a color to add this phone to the cart.` MUST be linked to the button with `aria-describedby` and MUST sit next to the button in the reading order.

#### Scenario: Hint linked
- **WHEN** assistive technology reads the add button
- **THEN** it announces the hint text as the button's description

#### Scenario: Hint in reading order
- **WHEN** the info column is read in order
- **THEN** the hint immediately follows the add button

### Requirement: Cart line payload
Activating the button MUST add a cart line with the product's id, brand and name, the selected color's image, the selected storage (raw capacity string and price) and the selected color (name and hex code).

#### Scenario: Line contents
- **GIVEN** storage `256 GB` at `959.42` and color `Titanium Blue` `#1F3A5F` are selected
- **WHEN** the add button is activated
- **THEN** the cart receives a line with the product id, brand and name, the image of the selected color, storage `256 GB` / `959.42`, and color `Titanium Blue` / `#1F3A5F`

#### Scenario: Selected color image
- **WHEN** a color other than the first is selected and the button is activated
- **THEN** the added line carries that color's image, not the first color's

### Requirement: Repeat additions
The selection MUST be kept after adding, and every activation MUST add exactly one line, so two activations produce two lines.

#### Scenario: Selection kept
- **WHEN** the button is activated
- **THEN** the storage and color selections remain

#### Scenario: Every activation adds one line
- **GIVEN** a storage option and a color are selected
- **WHEN** the button is activated twice
- **THEN** the cart has two more lines

### Requirement: Feedback after adding
After adding, the header count MUST reflect the new number of cart lines, and a visually hidden `role="status"` text `{name} added to cart.` MUST be rendered for assistive technology.

#### Scenario: Header count changes
- **WHEN** the button is activated
- **THEN** the header count increases by one

#### Scenario: Announced text
- **WHEN** the button is activated
- **THEN** a `role="status"` element with the text `{name} added to cart.` is present
