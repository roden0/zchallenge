# product-options Specification

## Purpose

Defines how the detail view offers the product's storage and color choices: two labelled radio groups, how each option is displayed and read by assistive technology, the selected and focused appearance, and what happens when a product has no options.

## ADDED Requirements

### Requirement: Two radio groups
Storage and color MUST each be a group of native radio inputs inside a `fieldset` with a `legend`. The storage legend text is `STORAGE ¿HOW MUCH SPACE DO YOU NEED?` and the color legend text is `COLOR. PICK YOUR FAVOURITE.` At most one option per group is selected.

#### Scenario: Legends present
- **WHEN** the product is loaded
- **THEN** the storage group has a `legend` reading `STORAGE ¿HOW MUCH SPACE DO YOU NEED?`
- **AND** the color group has a `legend` reading `COLOR. PICK YOUR FAVOURITE.`

#### Scenario: One selection per group
- **GIVEN** a storage option is selected
- **WHEN** another storage option is selected
- **THEN** only the new one is selected

### Requirement: Keyboard behavior
Radio inputs MUST be visually hidden but focusable; the styled labels MUST be the visible control. Each group MUST be a single tab stop, and the arrow keys MUST move between the options of a group.

#### Scenario: One tab stop per group
- **WHEN** the user tabs into a group
- **THEN** focus lands on the currently selected option (or the first option) and the next tab leaves the group

#### Scenario: Arrow keys move inside the group
- **WHEN** focus is inside a group and the user presses an arrow key
- **THEN** focus and selection move to the next or previous option of the same group

### Requirement: No automatic selection
Nothing MUST be selected on load, even when a product has only one storage option or only one color option. No option is ever pre-selected by the app.

#### Scenario: Single-option product
- **GIVEN** a product with one storage option and one color option
- **WHEN** the view loads
- **THEN** no storage and no color are selected
- **AND** the add button is disabled

### Requirement: Storage option display
A storage option's visible label MUST be its capacity normalized to a single space between number and unit, and its accessible name MUST add a visually hidden suffix with that option's price, formatted like every other price in the app. The radio value MUST be the raw capacity string.

#### Scenario: Capacity normalized
- **WHEN** the API capacity is `128GB`
- **THEN** the option label text is `128 GB`

#### Scenario: Capacity already spaced
- **WHEN** the API capacity is `128 GB`
- **THEN** the option label text is `128 GB`

#### Scenario: Price for assistive technology
- **GIVEN** an option with capacity `256 GB` and price `959.42`
- **WHEN** assistive technology reads the option
- **THEN** its name is `256 GB, 959,42 EUR`

#### Scenario: Raw value kept for identity
- **WHEN** the option for capacity `128GB` is chosen
- **THEN** the selected value is the raw string `128GB`

### Requirement: Color option display
A color option MUST be a square swatch whose background is the option's `hexCode`, and its accessible name MUST be the color name (as visually hidden text). The `hexCode` MUST be validated against `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i` before use; an invalid value MUST fall back to a neutral swatch instead of an invalid background.

#### Scenario: Swatch background
- **GIVEN** a color option with `hexCode` `#1F3A5F`
- **THEN** its swatch background is that color

#### Scenario: Accessible name
- **GIVEN** a color option named `Titanium Blue`
- **WHEN** assistive technology reads the swatch
- **THEN** its accessible name is `Titanium Blue`

#### Scenario: Invalid hexCode
- **GIVEN** a color option whose `hexCode` is not a valid hex color
- **THEN** its swatch uses the neutral fallback appearance
- **AND** the view does not crash

### Requirement: Selected and focused appearance
The selected option MUST be distinguishable from the unselected ones by a change in its border, not by color hue alone. The color swatch MUST gain an outline when selected. The keyboard focus indicator MUST be visible on the focused option.

#### Scenario: Selected storage
- **WHEN** a storage option is selected
- **THEN** its border differs from the border of the unselected options

#### Scenario: Selected color
- **WHEN** a color is selected
- **THEN** its swatch gets an outline

#### Scenario: Focus ring
- **WHEN** an option is focused with the keyboard
- **THEN** a visible focus indicator is drawn on that option

### Requirement: Selected color name
Once a color is selected its name MUST appear as visible text under the swatches. Before any color is selected no color name is shown.

#### Scenario: Name shown after selection
- **WHEN** the color `Titanium Blue` is selected
- **THEN** the text `Titanium Blue` is visible under the swatches

#### Scenario: No name before selection
- **WHEN** no color is selected
- **THEN** no color name is visible

### Requirement: Missing option groups
When a product has no storage options, the storage group MUST NOT be rendered; when it has no color options, the color group MUST NOT be rendered. In both cases the view MUST NOT crash and the add button MUST stay disabled.

#### Scenario: No storage options
- **GIVEN** a product whose `storageOptions` array is empty
- **THEN** no storage group is rendered
- **AND** the view still shows the product and the add button stays disabled

#### Scenario: No color options
- **GIVEN** a product whose `colorOptions` array is empty
- **THEN** no color group is rendered
- **AND** the view still shows the product and the add button stays disabled
