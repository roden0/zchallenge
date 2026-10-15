# Spec Delta

## Purpose

Defines how the BFF reaches the upstream phones API: authentication, startup
configuration, request timeouts, payload validation, and the error contract it
returns to clients without ever exposing the API key.

## ADDED Requirements

### Requirement: Authenticated upstream requests
The BFF MUST send the `x-api-key` header, using the value of `UPSTREAM_API_KEY`,
on every request it makes to the upstream API, and MUST build each request URL
under `UPSTREAM_API_URL`.

#### Scenario: Key attached to every upstream call
- **WHEN** the BFF forwards a client request to the upstream API
- **THEN** the upstream request includes an `x-api-key` header carrying the configured key

#### Scenario: Requests target the configured base URL
- **WHEN** the BFF forwards a client request to the upstream API
- **THEN** the request URL is built under `UPSTREAM_API_URL`

### Requirement: Fail-fast configuration validation
At startup the BFF MUST require `UPSTREAM_API_URL` (an absolute `http` or `https`
URL) and `UPSTREAM_API_KEY` (present and non-empty). If either is missing or
invalid, the process MUST exit non-zero with a message that names the offending
variable and MUST NOT print its value.

#### Scenario: Missing or empty API key
- **WHEN** `UPSTREAM_API_KEY` is unset or empty at startup
- **THEN** the process fails to start and the message names `UPSTREAM_API_KEY` without printing its value

#### Scenario: Missing, empty or relative URL
- **WHEN** `UPSTREAM_API_URL` is unset, empty, or not an absolute `http`/`https` URL
- **THEN** the process fails to start and the message names `UPSTREAM_API_URL`

### Requirement: Optional settings and defaults
The BFF MUST treat `UPSTREAM_TIMEOUT_MS` as optional with a default of 15000 ms
and `PORT` as optional with a default of 3001.

#### Scenario: Defaults applied
- **WHEN** `UPSTREAM_TIMEOUT_MS` and `PORT` are unset
- **THEN** the upstream timeout is 15000 ms and the server listens on port 3001

### Requirement: Upstream request timeout
The BFF MUST abort an upstream request that does not complete within
`UPSTREAM_TIMEOUT_MS`.

#### Scenario: Upstream too slow
- **WHEN** the upstream does not respond within the configured timeout
- **THEN** the request is aborted and the client receives `504` with the `ApiError` shape

### Requirement: API key never exposed
The API key MUST NOT appear in any HTTP response body, log line or error message.

#### Scenario: Upstream rejects the key
- **WHEN** the upstream responds with `401`
- **THEN** the client receives `502` with a generic `ApiError`
- **AND** no response body or log line contains the key

### Requirement: Upstream payload validation
Before using an upstream payload, the BFF MUST validate it against the
documented shape with a type guard. A payload that does not match MUST be treated
as a bad gateway error.

#### Scenario: Malformed payload
- **WHEN** the upstream returns a `2xx` body that does not match the documented shape
- **THEN** the client receives `502` with the `ApiError` shape

### Requirement: Error responses use the ApiError shape
Every BFF error response MUST be JSON with a stable `{ error, message }` shape,
where `error` is an uppercase code and `message` is human-readable.

#### Scenario: Client error shape
- **WHEN** the BFF rejects invalid client input
- **THEN** the response body has string `error` and `message` fields

#### Scenario: Unknown route
- **WHEN** a client requests a route the BFF does not define
- **THEN** the response is `404` with the `ApiError` shape

### Requirement: Failure classification
The BFF MUST map failures to these codes: invalid client input → `400
BAD_REQUEST`; an unknown product or route, or an upstream `404` → `404
NOT_FOUND`; an upstream `401`, any other upstream non-2xx response, a network
failure or a malformed payload → `502 BAD_GATEWAY`; a timeout → `504
GATEWAY_TIMEOUT`.

#### Scenario: Upstream 404 becomes 404
- **WHEN** the upstream responds `404` for a product
- **THEN** the client receives `404` with the `ApiError` shape

#### Scenario: Upstream 401 becomes 502
- **WHEN** the upstream responds `401`
- **THEN** the client receives `502`, never `401`

#### Scenario: Network failure becomes 502
- **WHEN** the upstream cannot be reached
- **THEN** the client receives `502` with the `ApiError` shape

### Requirement: Unexpected exceptions
An unexpected exception MUST produce `500 INTERNAL_ERROR` with a generic message
and MUST NOT include a stack trace in the response body.

#### Scenario: Unhandled exception
- **WHEN** an unexpected exception occurs while handling a request
- **THEN** the client receives `500` with a generic `ApiError` and no stack trace
