## ADDED Requirements

### Requirement: Catalog search input structure and behavior
The catalog search provides an underline-only input with live debounced updates, clear button behavior, and URL synchronization.

#### Scenario: Search input structure
- GIVEN the catalog page
- WHEN rendered
- THEN the search field has placeholder "Search for a smartphone..."
- AND a real <label> that is visually hidden with the same text
- AND the field and counter are wrapped in a form with role="search"
- AND submitting the form does not reload the page

#### Scenario: Input constraints and styling
- GIVEN the search input
- WHEN rendered
- THEN it accepts at most 100 characters
- AND the native browser clear button is hidden
- AND the input hit area is at least 24px high via padding without moving the underline from its Figma position

#### Scenario: Live debounced search
- GIVEN the catalog page
- WHEN the user types characters
- THEN the field value updates immediately
- AND requests use the debounced value after 300 ms of no typing
- AND rapid typing produces at most one request per 300 ms window (no request per key)

#### Scenario: Whitespace normalization
- GIVEN the search input has only spaces
- WHEN the debounced value is computed
- THEN it behaves like an empty search

#### Scenario: Clear button visibility and action
- GIVEN the search input is empty
- THEN the clear button (×) is not present
- GIVEN the search input has text
- THEN the clear button is present
- AND its accessible name is "Clear search"
- AND the glyph × is aria-hidden="true"
- WHEN the clear button is activated
- THEN the input is emptied
- AND the full list is requested immediately (no debounce)
- AND focus returns to the input

#### Scenario: URL sync
- GIVEN opening /?q=samsung
- THEN the field is filled with "samsung" and filtered results are shown
- GIVEN the user types a search term
- THEN ?q=term is set in the URL using replace (no history entries)
- GIVEN the term becomes empty (cleared or all spaces)
- THEN the q parameter is removed from the URL
- GIVEN returning via browser Back from product detail
- THEN the term is restored
