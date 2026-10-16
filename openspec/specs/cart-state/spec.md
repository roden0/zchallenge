# cart-state Specification

## Purpose

Defines the in-memory cart shared by the whole app: what a cart line is, how lines are added, removed and replaced, how line identity and totals are derived, and what consumers get from the cart hook.

## Requirements

### Requirement: Adding a cart line
Every add MUST append one complete new line to the cart. A line is a snapshot of the chosen configuration: product id, brand, name, the image of the selected color, the selected storage (capacity and price at add time) and the selected color (name and hex code).

#### Scenario: Add appends a line
- **WHEN** `addLine` is called with a line that has no `lineId`
- **THEN** the cart has one more line than before
- **AND** the new line carries the provided product id, brand, name, image, storage and color values unchanged

#### Scenario: Identical configuration twice
- **WHEN** `addLine` is called twice with the same product, storage and color
- **THEN** the cart contains two lines

#### Scenario: Insertion order
- **WHEN** lines are added one after another
- **THEN** the lines are kept in insertion order, oldest first

#### Scenario: Snapshot price
- **GIVEN** a line was added while its storage price was `959.42`
- **WHEN** the upstream price later changes
- **THEN** the line still carries `959.42` (the price is never revalidated against the API)

### Requirement: Cart line identity
Each line MUST have a `lineId` created when the line is added, and lineIds MUST be unique inside the cart.

#### Scenario: lineId generated at add time
- **WHEN** `addLine` is called
- **THEN** the stored line has a non-empty `lineId` that was not supplied by the caller

#### Scenario: Uniqueness inside the cart
- **WHEN** many lines are added, including identical configurations
- **THEN** every `lineId` in the cart is distinct

### Requirement: Removing a cart line
Removing a line MUST be done by `lineId` and MUST affect exactly that line.

#### Scenario: Remove an existing line
- **GIVEN** a cart with several lines
- **WHEN** `removeLine` is called with a `lineId` present in the cart
- **THEN** that line is gone and the remaining lines keep their order

#### Scenario: Unknown lineId is a no-op
- **WHEN** `removeLine` is called with a `lineId` not in the cart
- **THEN** the state object returned is the same reference as before (no change)

### Requirement: Replacing the cart list
A `replace` action MUST set the whole list from an already-validated list of lines; it is used to adopt state observed elsewhere (another tab).

#### Scenario: Replace adopts the given list
- **WHEN** `replace` is dispatched with a validated list of lines
- **THEN** the cart state contains exactly that list, in the given order

### Requirement: Reducer purity
The reducer MUST be a pure, exported function: it generates no ids, touches no storage and never mutates the previous state.

#### Scenario: Previous state not mutated
- **WHEN** the reducer handles any action
- **THEN** the previous state object and its `lines` array are unchanged

### Requirement: Derived cart values
`itemCount` MUST be the number of lines. `totalCents` MUST be the sum of `Math.round(price * 100)` over every line; a total in euros is `totalCents / 100`.

#### Scenario: Item count
- **GIVEN** a cart with 3 lines
- **THEN** `itemCount` is `3`
- **AND** `itemCount` is `0` for an empty cart

#### Scenario: Total in integer cents
- **GIVEN** a cart with lines priced `959.42` and `117.29`
- **THEN** `totalCents` is `107671`
- **AND** `totalCents / 100` is exactly `1076.71`

#### Scenario: Empty cart total
- **GIVEN** an empty cart
- **THEN** `totalCents` is `0`

### Requirement: useCart contract
`useCart()` MUST return `{ lines, itemCount, totalCents, addLine, removeLine }`. `addLine` MUST accept a line without `lineId`. Using the hook outside the provider MUST throw a clear error.

#### Scenario: Returned API
- **WHEN** `useCart` is called inside the provider
- **THEN** it returns the current `lines`, `itemCount`, `totalCents`, and the `addLine` and `removeLine` functions

#### Scenario: addLine input without lineId
- **WHEN** `addLine` is called with a line object that has no `lineId`
- **THEN** the resulting line has a provider-generated `lineId`

#### Scenario: Outside the provider
- **WHEN** `useCart` is called with no provider above it
- **THEN** it throws an error whose message identifies the missing cart provider
