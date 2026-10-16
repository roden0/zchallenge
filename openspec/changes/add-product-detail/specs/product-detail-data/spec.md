# product-detail-data Specification

## Purpose

Defines how the detail view loads a product: the request it makes, the loading, not-found and error states it renders, the document titles for each state, and how navigating to a different id cancels the previous request.

## ADDED Requirements

### Requirement: Product request
The view MUST request `GET /api/products/{id}` using the id from the current URL, URL-encoded.

#### Scenario: Known id
- **WHEN** the view opens on `/products/SMG-S24U`
- **THEN** a request is made to `/api/products/SMG-S24U`

#### Scenario: Id needing encoding
- **WHEN** the view opens on an id that contains a space (for example `/products/a b`)
- **THEN** the request path contains that id URL-encoded (`a%20b`)

### Requirement: Loading state
While the first request for the current id is pending, the view MUST render a `role="status"` element with the text `LOADING...` and the back link, and MUST NOT render any product content.

#### Scenario: First load pending
- **WHEN** the view opens and the request has not finished
- **THEN** a `role="status"` element with text `LOADING...` is shown
- **AND** the back link is shown
- **AND** no product name, price, selectors, image or specifications are shown

### Requirement: Not found state
A `404` or `400` response MUST render the not-found state: the `h1` `PRODUCT NOT FOUND` and the back link, with no product content and no retry control.

#### Scenario: Unknown id
- **WHEN** the request completes with status `404`
- **THEN** the `h1` is `PRODUCT NOT FOUND` and the back link is shown
- **AND** no retry control is shown

#### Scenario: Invalid id
- **WHEN** the request completes with status `400`
- **THEN** the view shows the same not-found state

### Requirement: Error state
A network failure, any status other than `200`, `404` and `400`, or an unparsable response MUST render a `role="alert"` element with the text `COULD NOT LOAD PRODUCT` and a `RETRY` button. The raw error message from the BFF or any status code MUST NOT be shown.

#### Scenario: Network failure
- **WHEN** the request fails because the network is unavailable
- **THEN** a `role="alert"` element shows `COULD NOT LOAD PRODUCT`
- **AND** a `RETRY` button is shown
- **AND** neither the raw BFF message nor a status code appears anywhere in the view

#### Scenario: Server error
- **WHEN** the request completes with status `502`
- **THEN** the same error state is shown

#### Scenario: Invalid JSON
- **WHEN** the response body is not valid JSON
- **THEN** the same error state is shown

#### Scenario: Retry
- **WHEN** the `RETRY` button is activated
- **THEN** the request is repeated
- **AND** the loading state with `LOADING...` is shown again

### Requirement: Document titles
The document title MUST be `{name} | MBST` when the product is loaded, `Product | MBST` while loading and after an error, and `Product not found | MBST` in the not-found state.

#### Scenario: Loaded title
- **WHEN** the product has loaded with name `Galaxy S24 Ultra`
- **THEN** the document title is `Galaxy S24 Ultra | MBST`

#### Scenario: Loading title
- **WHEN** the request is still pending
- **THEN** the document title is `Product | MBST`

#### Scenario: Error title
- **WHEN** the request has failed
- **THEN** the document title is `Product | MBST`

#### Scenario: Not found title
- **WHEN** the not-found state is shown
- **THEN** the document title is `Product not found | MBST`

### Requirement: Changing the id
When the URL id changes, the pending request for the old id MUST be aborted, responses that arrive for an old id MUST NOT set state or log anything, and every selection MUST reset to the unselected initial state.

#### Scenario: Old request aborted
- **GIVEN** the request for the previous id is still pending
- **WHEN** the URL id changes
- **THEN** the old request is aborted and its result is never applied

#### Scenario: Late response ignored
- **GIVEN** a response for the old id arrives after the id changed
- **THEN** the view keeps showing the state for the new id
- **AND** nothing is written to the console

#### Scenario: Selection resets
- **GIVEN** a storage option and a color are selected
- **WHEN** the URL id changes
- **THEN** nothing is selected any more
- **AND** the price shows `From {basePrice} EUR` for the new product
- **AND** the first color image of the new product is shown
- **AND** the add button is disabled again

#### Scenario: Aborted requests are silent
- **WHEN** a request is aborted for any reason
- **THEN** nothing is logged to the console and no state is set from it
