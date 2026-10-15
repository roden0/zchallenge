# app-routing Specification

## Purpose
Defines the client-side routing behavior: routes, where views render, placeholders, not-found behavior, navigation focus/scroll, document titles, and h1 requirements.

## Requirements

### Requirement: Routes
The app MUST provide routes for `/`, `/products/:id`, and `/cart`, and a not-found fallback for any other path.

#### Scenario: Catalog route
- **WHEN** the user navigates to `/`
- **THEN** the catalog view is rendered inside the shared layout

#### Scenario: Product detail route
- **WHEN** the user navigates to `/products/:id`
- **THEN** the product detail placeholder is rendered inside the shared layout

#### Scenario: Cart route
- **WHEN** the user navigates to `/cart`
- **THEN** the cart view is rendered inside the shared layout

#### Scenario: Not-found route
- **WHEN** the user navigates to any unknown path
- **THEN** the not-found view is rendered with a short text message and a link to `/`

### Requirement: Placeholders inside layout
Each of the three views and the not-found view MUST render inside the shared layout. Placeholders are minimal and text-only (not-found monochrome).

#### Scenario: Catalog placeholder
- **WHEN** viewing `/`
- **THEN** the catalog content is shown inside the layout

#### Scenario: Detail placeholder
- **WHEN** viewing `/products/:id`
- **THEN** the detail content is shown inside the layout

#### Scenario: Cart placeholder
- **WHEN** viewing `/cart`
- **THEN** the cart content is shown inside the layout

### Requirement: SPA navigation
Navigating between routes MUST NOT reload the page (client-side navigation).

#### Scenario: Navigate between routes
- **WHEN** clicking internal links between `/`, `/cart`, `/products/:id`, and `/`
- **THEN** the page does not perform a full reload

### Requirement: Scroll to top and focus main after first load
On every navigation after the first load, the page MUST scroll to the top and focus MUST move to the main region. The first render MUST NOT steal focus.

#### Scenario: Navigation after first load
- **WHEN** navigating to a new route after initial page load
- **THEN** `window.scrollTo` is called to scroll to top and focus moves to the `main` region

#### Scenario: First render does not steal focus
- **WHEN** the app first mounts
- **THEN** focus is NOT moved to the main region

### Requirement: Document titles
Each route MUST set a meaningful `document.title`. Detail placeholder uses a generic title until the product feature sets the real name.

#### Scenario: Catalog title
- **WHEN** on `/`
- **THEN** `document.title` is "Smartphones | MBST"

#### Scenario: Product detail title
- **WHEN** on `/products/:id`
- **THEN** `document.title` is "Product | MBST" (generic placeholder title)

#### Scenario: Cart title
- **WHEN** on `/cart`
- **THEN** `document.title` is "Cart | MBST"

#### Scenario: Not-found title
- **WHEN** on unknown path
- **THEN** `document.title` is "Page not found | MBST"

### Requirement: Exactly one h1 per view
Each view MUST have exactly one `h1`. The catalog's `h1` is visually hidden ("Smartphones"); detail and cart placeholders use a visible `h1` for now.

#### Scenario: Catalog has visually hidden h1
- **WHEN** on `/`
- **THEN** there is exactly one `h1` with accessible text "Smartphones" (visually hidden)

#### Scenario: Detail placeholder has visible h1
- **WHEN** on `/products/:id`
- **THEN** there is exactly one visible `h1`

#### Scenario: Cart placeholder has visible h1
- **WHEN** on `/cart`
- **THEN** there is exactly one visible `h1`

#### Scenario: Not-found has exactly one h1
- **WHEN** on unknown path
- **THEN** there is exactly one `h1` (visible)
