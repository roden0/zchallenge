## ADDED Requirements

### Requirement: Catalog results loading, counter, states, and error handling
The catalog results handle loading, counter updates, stale response rejection, aborts, empty state, error state, and BFF behavior constraints.

#### Scenario: Initial request
- GIVEN the catalog page loads
- WHEN no query is present
- THEN GET /api/products?limit=20 is called (no search param)
- AND every request uses limit=20

#### Scenario: Loading states
- GIVEN initial load before response
- THEN no cards are shown
- AND the status region shows "LOADING..."
- AND there is no grid
- WHEN a new search is initiated while previous results exist
- THEN previous cards and counter remain visible until the new response arrives
- AND the results region has aria-busy="true"

#### Scenario: Counter behavior
- GIVEN results with n products
- THEN the counter is role="status" and shows "{n} RESULTS" (uppercase)
- AND "1 RESULT" when n==1
- AND "0 RESULTS" when n==0
- AND the counter text only changes when a response arrives (not on every keystroke)
- AND it always reflects the number of cards on screen

#### Scenario: Stale response handling
- GIVEN request A for term X and request B for term Y overlap
- WHEN request A answers after request B
- THEN the screen shows results for term Y (stale response discarded)

#### Scenario: Abort handling
- GIVEN a request is superseded or component unmounts
- WHEN the request is aborted
- THEN no error is logged and no state is set

#### Scenario: Empty results
- GIVEN a search returns 0 products
- THEN the grid is replaced by "No smartphones found for "{term}"."
- AND the text is uppercase and in monochrome style
- AND long terms wrap

#### Scenario: Error state
- GIVEN a network failure, BFF error body, or malformed JSON occurs
- THEN the grid and counter are replaced by a role="alert" message "COULD NOT LOAD SMARTPHONES"
- AND a "RETRY" button styled like outlined buttons is shown
- WHEN the RETRY button is activated
- THEN the same query is retried
- AND "LOADING..." is shown
- WHEN retry succeeds
- THEN focus moves to the search field (button no longer present)
- AND no raw BFF message or status code is shown to the user

#### Scenario: BFF guarantees
- GIVEN results from BFF
- THEN results keep BFF order
- AND the web app does not sort, filter, or deduplicate
