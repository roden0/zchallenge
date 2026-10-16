# product-detail-layout Specification

## Purpose

Defines the structure of the detail view: the back link, the product heading, how the image and info column are arranged across breakpoints, the color-driven image, and the specifications table.

## ADDED Requirements

### Requirement: Back link
A `< BACK` link to `/` MUST sit under the header, its glyph MUST be hidden from assistive technology, and the link MUST be present in every state of the view.

#### Scenario: Points home
- **WHEN** the link is activated
- **THEN** the app navigates to `/`

#### Scenario: Accessible name
- **WHEN** assistive technology reads the link
- **THEN** its accessible name is `BACK` and the glyph is not announced

#### Scenario: Present in every state
- **WHEN** the view is loading, not found, in error or loaded
- **THEN** the back link is rendered

### Requirement: Product heading
The view MUST always render exactly one `h1`. When the product is loaded the `h1` MUST be the product name, displayed uppercase. While loading or in error the `h1` MUST be a visually hidden generic `Product`. In the not-found state the `h1` is `PRODUCT NOT FOUND`.

#### Scenario: Loaded heading
- **WHEN** the product `edge 50 Pro` is loaded
- **THEN** the `h1` shows `EDGE 50 PRO`

#### Scenario: Exactly one heading
- **WHEN** the view renders in any state
- **THEN** exactly one `h1` is present

### Requirement: Responsive arrangement
On desktop and tablet the image MUST sit on the left of a centered container of about `1200px` and a `380px` info column MUST sit on the right. On mobile the image MUST sit on top and the info column below it, both full width.

#### Scenario: Desktop side by side
- **WHEN** the viewport is `1920px` wide
- **THEN** the image is on the left and the info column on the right of the centered container

#### Scenario: Tablet side by side
- **WHEN** the viewport is `834px` wide
- **THEN** the image and the info column are side by side

#### Scenario: Mobile stacked
- **WHEN** the viewport is `393px` wide
- **THEN** the image is above the info column and both are full width

### Requirement: No horizontal scrolling
The view MUST NOT produce horizontal scrolling at `393px`, `834px` or `1920px` wide.

#### Scenario: No horizontal scroll
- **WHEN** the view is open at `393px`, `834px` or `1920px` wide
- **THEN** the page has no horizontal scrollbar and no content overflows the viewport

### Requirement: Info column reading order
The info column MUST read, in order: product name, price, storage selector, color selector, add-to-cart button with its hint.

#### Scenario: Order top to bottom
- **WHEN** the product is loaded
- **THEN** the accessible reading order is name, price, storage selector, color selector, add button

### Requirement: Image follows the selected color
Before a color is selected the image MUST be the first color option's image. After a color is selected the image and its `alt` text MUST follow that color: `alt` is the product name before any selection and `{name}, {color name}` after. The image area MUST keep a stable aspect ratio so changing the image never shifts the layout.

#### Scenario: Initial image
- **WHEN** the product is loaded and no color is selected
- **THEN** the image is the first color option's image
- **AND** the `alt` text is the product name

#### Scenario: Image follows the color
- **WHEN** the color `Titanium Blue` is selected
- **THEN** the image source is that color's image
- **AND** the `alt` text is `{name}, Titanium Blue`

#### Scenario: No layout jump
- **WHEN** the selected color changes
- **THEN** the image area keeps the same reserved aspect ratio and the surrounding layout does not move

### Requirement: Specifications table
A `SPECIFICATIONS` section MUST contain a real table whose header cells use `scope="row"`. Rows MUST appear in the order BRAND, NAME, DESCRIPTION, SCREEN, RESOLUTION, PROCESSOR, MAIN CAMERA, SELFIE CAMERA, BATTERY, OS, SCREEN REFRESH RATE. Values MUST be shown as they come, a missing value MUST show `-`, and `rating` MUST NOT be displayed anywhere.

#### Scenario: Section title
- **WHEN** the product is loaded
- **THEN** an `h2` with the text `SPECIFICATIONS` is shown above the table

#### Scenario: Row order
- **WHEN** the table is read top to bottom
- **THEN** the row labels are BRAND, NAME, DESCRIPTION, SCREEN, RESOLUTION, PROCESSOR, MAIN CAMERA, SELFIE CAMERA, BATTERY, OS, SCREEN REFRESH RATE

#### Scenario: Row headers
- **WHEN** assistive technology inspects a row
- **THEN** its label cell is a `th` with `scope="row"`

#### Scenario: Values as they come
- **WHEN** a specification value has unusual casing (for example `edge 50 Pro`)
- **THEN** the table shows it exactly as received

#### Scenario: Missing value
- **WHEN** the product has no value for a row
- **THEN** that row's value is `-`

#### Scenario: Rating hidden
- **WHEN** the product has a `rating`
- **THEN** no rating value or rating row appears in the view
