# cart-persistence Specification

## Purpose

Defines how the cart survives reloads and stays consistent across tabs: where it is stored, how untrusted stored data is validated, when state is written, and how storage failures and cross-tab changes are handled.

## ADDED Requirements

### Requirement: Storage format
The cart MUST be stored under the key `mbst:cart:v1` as JSON of the shape `{ "version": 1, "lines": [...] }`.

#### Scenario: Key and value shape
- **WHEN** the cart is read from or written to storage
- **THEN** the key is `mbst:cart:v1`
- **AND** the value is JSON with `version: 1` and a `lines` array of cart lines

### Requirement: Synchronous initial read
The initial state MUST be read from storage synchronously during the first render, so a returning visitor never sees a `0` flash in the header.

#### Scenario: Returning visitor sees the real count
- **GIVEN** storage holds a valid cart with 2 lines
- **WHEN** the app renders for the first time in a new session
- **THEN** the header count is `2` from the first paint

#### Scenario: First-time visitor
- **GIVEN** nothing is stored under the key (or storage is unavailable)
- **WHEN** the app renders
- **THEN** the cart starts empty

### Requirement: Validation of stored data
Stored data is untrusted and MUST be validated on read: invalid JSON, a non-object value or a different `version` MUST yield an empty cart; each line MUST be checked field by field (all fields present with the right types, non-empty strings, price finite and `>= 0`); invalid lines MUST be dropped while valid ones are kept; a repeated `lineId` MUST keep only the first line.

#### Scenario: Invalid JSON
- **WHEN** the stored value is not valid JSON
- **THEN** the cart starts empty

#### Scenario: Non-object value
- **WHEN** the stored value is valid JSON but not an object (for example a number or an array)
- **THEN** the cart starts empty

#### Scenario: Wrong version
- **WHEN** the stored object has a `version` other than `1`
- **THEN** the cart starts empty

#### Scenario: Invalid line dropped, valid kept
- **GIVEN** a stored `lines` array where one line misses its `storage` field
- **WHEN** the cart is read
- **THEN** that line is dropped and the other valid lines are kept

#### Scenario: Repeated lineId
- **GIVEN** two stored lines with the same `lineId`
- **WHEN** the cart is read
- **THEN** only the first of them is kept

#### Scenario: Negative or non-numeric price
- **GIVEN** a stored line whose price is negative or not a number
- **WHEN** the cart is read
- **THEN** that line is dropped

#### Scenario: Missing or empty field
- **GIVEN** a stored line with an empty `name` (or any other required field missing or empty)
- **WHEN** the cart is read
- **THEN** that line is dropped

### Requirement: Persisting state changes
State MUST be written to storage after it changes, from an effect — never from the reducer — and the serialized form MUST be deterministic.

#### Scenario: Add is persisted
- **WHEN** a line is added and effects have run
- **THEN** the stored value contains that line

#### Scenario: Remove is persisted
- **WHEN** a line is removed and effects have run
- **THEN** the stored value no longer contains that line

### Requirement: Storage failures stay in memory
Every storage access MUST be wrapped so that a storage that throws on read or on write (disabled storage, quota exceeded, private mode) never breaks the app and nothing is printed to the console.

#### Scenario: Read throws
- **GIVEN** reading from storage throws
- **WHEN** the app starts
- **THEN** the cart works in memory starting from empty
- **AND** the console stays empty

#### Scenario: Write throws
- **GIVEN** writing to storage throws
- **WHEN** a line is added or removed
- **THEN** the in-memory cart still updates
- **AND** the console stays empty

### Requirement: Cross-tab synchronization
When another tab changes `mbst:cart:v1`, this tab MUST replace its state with the validated new value; a removed key MUST yield an empty cart; changes to other keys MUST be ignored; syncing MUST never create a write loop between tabs.

#### Scenario: Another tab changes the cart
- **GIVEN** two open tabs
- **WHEN** one tab writes a valid cart under the key
- **THEN** the other tab's state is replaced with that cart

#### Scenario: Key removed
- **WHEN** the key is removed in another tab
- **THEN** this tab's cart becomes empty

#### Scenario: Other keys ignored
- **WHEN** a storage event arrives for a different key
- **THEN** the cart state is unchanged

#### Scenario: No write loop
- **GIVEN** two tabs that have received each other's storage
- **WHEN** they have converged
- **THEN** neither tab keeps writing (the sync settles)
