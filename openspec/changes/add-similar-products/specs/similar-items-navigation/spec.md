# similar-items-navigation Specification

## Purpose

Defines what happens when a card in the detail view's `SIMILAR ITEMS` row is activated: navigating to that product within the detail view, the scroll and focus reset, returning with the browser Back button, and reaching the row by keyboard.

## ADDED Requirements

### Requirement: Card navigates to its product
Activating a similar-items card MUST navigate to that product's detail view at `/products/{id}` using client-side navigation, without a full page reload.

#### Scenario: Open a similar product
- **WHEN** a card for product `GPX-8A` is activated
- **THEN** the view shows the detail of `GPX-8A`
- **AND** the URL is `/products/GPX-8A`
- **AND** the page was not fully reloaded

### Requirement: Detail view resets for the new product
After navigating to another product from the row, the view MUST show the new product's data and image, and MUST reset the storage and color selections so the add button is disabled and the price shows `From {price}` until the user chooses again.

#### Scenario: Selections reset
- **WHEN** a similar-items card is activated after choosing a storage and a color
- **THEN** the new product's name, price, image and specifications are shown
- **AND** no storage or color is selected
- **AND** the add-to-cart button is disabled
- **AND** the price shows `From {basePrice}`

#### Scenario: Previous request cancelled
- **WHEN** a similar-items card is activated while the current product's request is still pending
- **THEN** the previous request is aborted and a request for the new product's id is made

### Requirement: Scroll to top and focus main
Navigating from the row MUST scroll the page to the top and move focus to the main region, as the app does on every navigation after the first load.

#### Scenario: After navigation
- **WHEN** a similar-items card is activated
- **THEN** the page scrolls to the top
- **AND** focus moves to the main region

### Requirement: Browser Back returns to the previous product
Pressing the browser Back button after navigating from the row MUST return to the product that was shown before.

#### Scenario: Back returns
- **WHEN** the user navigates from product `A` to product `B` through the row and then presses Back
- **THEN** the detail of product `A` is shown again

### Requirement: Keyboard reach
The row MUST be reachable by keyboard: tabbing reaches each card, and the focused card MUST be scrolled into view.

#### Scenario: Tab through the row
- **WHEN** the user tabs through the cards in the row
- **THEN** each card receives focus in turn
- **AND** the focused card is scrolled into view

### Requirement: No duplicated landmark
The section MUST NOT introduce a landmark region that duplicates an existing one; the title `h2` alone labels the section, as the specifications section already does.

#### Scenario: Section is not a landmark
- **WHEN** assistive technology lists the page landmarks
- **THEN** the similar-items section does not add a landmark beyond the existing ones
- **AND** its content is still announced under the `SIMILAR ITEMS` heading
