# Spec Delta

## Purpose

Puts the cart view inside the shared shell frame and fixes its title, responsive typography reaches and vertical rhythm so the view matches the rest of the app at every supported width.

## ADDED Requirements

### Requirement: Cart page frame and title

The cart view SHALL use the shell horizontal page padding and SHALL set the document title to `Cart | MBST`.

#### Scenario: Document title

- **WHEN** the cart view is shown
- **THEN** the document title is `Cart | MBST`

#### Scenario: Shell padding

- **WHEN** the cart view is shown
- **THEN** its content uses the same horizontal page padding as the catalog and the product detail

### Requirement: No horizontal scrolling

The cart view SHALL not scroll horizontally at 393px, 834px or 1920px.

#### Scenario: Supported widths

- **WHEN** the cart view is shown at 393px, 834px or 1920px
- **THEN** the page does not scroll horizontally

### Requirement: Desktop vertical rhythm

On desktop the cart SHALL follow the approximate measured rhythm below; these values are approximate and appear as `[CONFIRM]` in `docs/design-notes.md`: heading ≈70px below the header, first line ≈100px below the heading, line image ≈190px wide, info column ≈65px to the right of the image, name and options ≈18px apart, price ≈34px below the options, and ≈55px of space below the footer buttons.

#### Scenario: Heading spacing

- **WHEN** the cart is shown on desktop
- **THEN** the heading sits about 70px below the header

#### Scenario: First line spacing

- **WHEN** the cart has lines on desktop
- **THEN** the first line sits about 100px below the heading

#### Scenario: Image width

- **WHEN** the cart is shown
- **THEN** the line image is about 190px wide on desktop and about 150px wide on mobile

#### Scenario: Info column spacing

- **WHEN** a line is shown on desktop
- **THEN** the info column sits about 65px to the right of the image, with the name and options about 18px apart and the price about 34px below the options

#### Scenario: Values documented

- **WHEN** `docs/design-notes.md` is read
- **THEN** these cart spacing values are listed and marked `[CONFIRM]`
