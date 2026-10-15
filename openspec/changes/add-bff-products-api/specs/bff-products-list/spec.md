# Spec Delta

## Purpose

Defines the behavior of `GET /api/products`: how query parameters are validated,
how `search` is forwarded, and how the BFF deduplicates and paginates results
before returning a plain array to the client.

## ADDED Requirements

### Requirement: Search parameter handling
The BFF MUST trim `search` and omit it from the upstream request when it is empty
after trimming. A trimmed `search` longer than 100 characters MUST be rejected
with `400`. `search` is the only query parameter forwarded upstream.

#### Scenario: Empty search omitted
- **WHEN** `search` is absent, empty, or only whitespace
- **THEN** no `search` parameter is sent upstream

#### Scenario: Search forwarded
- **WHEN** `search` has a non-empty trimmed value
- **THEN** that trimmed value is sent to the upstream as the `search` parameter

#### Scenario: Over-long search rejected
- **WHEN** the trimmed `search` is longer than 100 characters
- **THEN** the response is `400` with the `ApiError` shape

### Requirement: Limit parameter validation
`limit` is optional. When present it MUST be an integer greater than or equal to
1, otherwise the BFF MUST respond `400`. A value above `MAX_LIMIT` (100) MUST be
clamped to 100. When omitted, all deduplicated products are returned.

#### Scenario: Invalid limit
- **WHEN** `limit` is not an integer, or is less than 1
- **THEN** the response is `400` with the `ApiError` shape

#### Scenario: Limit above the maximum is clamped
- **WHEN** `limit` is greater than 100
- **THEN** at most 100 products are returned

#### Scenario: Limit omitted
- **WHEN** `limit` is absent
- **THEN** all deduplicated products are returned

### Requirement: Offset parameter validation
`offset` is optional. When present it MUST be an integer greater than or equal to
0, otherwise the BFF MUST respond `400`. When omitted it defaults to 0.

#### Scenario: Invalid offset
- **WHEN** `offset` is not an integer, or is less than 0
- **THEN** the response is `400` with the `ApiError` shape

#### Scenario: Offset omitted
- **WHEN** `offset` is absent
- **THEN** no products are skipped from the start of the list

### Requirement: Repeated and unknown parameters
A known query parameter that appears more than once in the query string MUST
cause a `400` response. Unknown query parameters MUST be ignored and MUST NOT be
forwarded upstream.

#### Scenario: Repeated known parameter
- **WHEN** the query string contains `limit=1&limit=2`
- **THEN** the response is `400` with the `ApiError` shape

#### Scenario: Unknown parameter
- **WHEN** the query string contains a parameter the BFF does not define
- **THEN** the parameter is ignored and is not forwarded upstream

### Requirement: Deduplicate before pagination
The BFF MUST forward only `search`, validate the upstream payload, then remove
duplicate products by `id` keeping the first occurrence, then apply `offset`, and
finally apply `limit`, in that order.

#### Scenario: Duplicated upstream id
- **WHEN** the upstream returns two products with the same `id`
- **THEN** the response contains that product once

#### Scenario: Limit counts distinct products
- **WHEN** at least 20 distinct products exist and `limit=20` is requested
- **THEN** the response contains 20 distinct products

### Requirement: Image URL normalization
An `imageUrl` that points at the upstream host over `http` MUST be returned as
`https`.

#### Scenario: http image rewritten
- **WHEN** a product `imageUrl` is `http://<upstream-host>/...`
- **THEN** the response returns the same URL with the `https://` scheme

### Requirement: List response shape
A successful list response MUST be a plain JSON array of products in upstream
order. A search that matches nothing MUST return `200` with an empty array and
never `404`.

#### Scenario: No matches
- **WHEN** the search matches no products
- **THEN** the response is `200` with an empty array

#### Scenario: Plain array in upstream order
- **WHEN** the request succeeds
- **THEN** the body is a JSON array of product summaries in upstream order
