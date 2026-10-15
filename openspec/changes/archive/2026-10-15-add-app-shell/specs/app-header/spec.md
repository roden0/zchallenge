# app-header Specification

## Purpose

Defines the header: visibility on all views, landmarks, logo and cart link, item count, bag icon states, accessibility names, sizing, sticky behavior.

## ADDED Requirements

### Requirement: Header on every view
The header MUST appear on every view, including the cart.

#### Scenario: Header present on catalog
- **WHEN** on `/`
- **THEN** the header is rendered

#### Scenario: Header present on product detail
- **WHEN** on `/products/:id`
- **THEN** the header is rendered

#### Scenario: Header present on cart
- **WHEN** on `/cart`
- **THEN** the header is rendered

#### Scenario: Header present on not-found
- **WHEN** on unknown path
- **THEN** the header is rendered

### Requirement: Landmarks
The header MUST be inside a `<header>` landmark, and there MUST be a `<nav>` landmark labeled "Main".

#### Scenario: Header landmark exists
- **WHEN** viewing any route
- **THEN** exactly one `<header>` landmark is present

#### Scenario: Nav landmark labeled Main
- **WHEN** viewing any route
- **THEN** exactly one `<nav>` with `aria-label="Main"` is present

### Requirement: Logo
The left side of the header contains the logo as a link to `/`. The link's accessible name is "MBST, home". The image inside is decorative (`alt=""`).

#### Scenario: Logo link points home
- **WHEN** on any route
- **THEN** the logo link's `href` is `/`

#### Scenario: Logo accessible name
- **WHEN** on any route
- **THEN** the logo link has accessible name "MBST, home"

#### Scenario: Logo image decorative
- **WHEN** on any route
- **THEN** the logo image has `alt=""`

### Requirement: Cart link and count
The right side shows a link to `/cart` with the bag icon and item count. The count comes from an `itemCount` prop (number), defaulted to `0` for now.

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

### Requirement: Bag icon states
`itemCount === 0` shows `bag_inactive.svg`. `itemCount >= 1` shows `bag_active.svg`. The count is always visible, including `0`.

#### Scenario: Zero items shows inactive
- **WHEN** `itemCount` is `0`
- **THEN** the inactive bag icon is shown

#### Scenario: One or more shows active
- **WHEN** `itemCount` is `1`
- **THEN** the active bag icon is shown

#### Scenario: Count always visible
- **WHEN** `itemCount` is `0`
- **THEN** the count text "0" is visible

### Requirement: Sizing and sticky
Header height is `80px` on all widths. Horizontal padding comes from the page padding token. The header stays at the top while scrolling (sticky) with white background.

#### Scenario: Header height 80px
- **WHEN** on any route
- **THEN** the header has height `80px`

#### Scenario: Sticky header
- **WHEN** scrolling the page
- **THEN** the header remains visible at the top (sticky) with white background
