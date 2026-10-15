## ADDED Requirements

### Requirement: Typed API client
A small typed fetch wrapper for API calls with consistent error handling and abort support.

#### Scenario: Basic behavior
- GIVEN a call to fetch a resource
- WHEN successful with 2xx
- THEN it returns parsed JSON of the expected type
- AND it takes a path and an AbortSignal
- AND uses relative paths under /api

#### Scenario: Error handling
- GIVEN a non-2xx response
- THEN it throws a typed error that includes the HTTP status when available
- GIVEN a network failure
- THEN it throws a typed error representing the network failure
- GIVEN invalid JSON
- THEN it throws a typed error for malformed JSON

#### Scenario: Abort behavior
- GIVEN a request is aborted
- THEN the abort propagates as an abort error (no retry)
- AND the client does not retry on its own
