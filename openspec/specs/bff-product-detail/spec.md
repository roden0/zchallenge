# bff-product-detail Specification

## Purpose

Defines the behavior of `GET /api/products/:id`: id validation, the product
detail payload with untouched numeric values, reference-list cleanup, and the
`404` returned for an unknown product.

## Requirements

### Requirement: Product id validation
The BFF MUST accept an `:id` only when it matches `^[A-Za-z0-9_-]{1,64}$` and
otherwise MUST respond `400`. The id MUST be URL-encoded when building the
upstream URL.

#### Scenario: Malformed id rejected
- **WHEN** the id contains characters outside letters, digits, underscore or hyphen, or is longer than 64 characters
- **THEN** the response is `400` with the `ApiError` shape

#### Scenario: Valid id forwarded encoded
- **WHEN** the id matches the allowed pattern
- **THEN** the upstream request targets the detail URL with the id URL-encoded

### Requirement: Product detail response
For a known id the BFF MUST return the product detail. Numeric values, including
decimals, MUST be passed through untouched.

#### Scenario: Known id returns detail
- **WHEN** a known id is requested
- **THEN** the response is `200` with the product detail

#### Scenario: Decimal prices preserved
- **WHEN** the product detail contains decimal numbers
- **THEN** the response returns them with the same value

### Requirement: Similar products cleanup
`similarProducts` MUST be deduplicated by `id` and MUST NOT contain the requested
product itself, even when the upstream data does.

#### Scenario: Requested product removed
- **WHEN** the upstream `similarProducts` contains the requested product
- **THEN** the response excludes the requested product from `similarProducts`

#### Scenario: Duplicate similar products removed
- **WHEN** the upstream `similarProducts` repeats an `id`
- **THEN** the response contains that entry once

### Requirement: Detail image URL normalization
`colorOptions[].imageUrl` and `similarProducts[].imageUrl` that point at the
upstream host over `http` MUST be returned as `https`.

#### Scenario: http detail images rewritten
- **WHEN** a color or similar-product `imageUrl` is `http://<upstream-host>/...`
- **THEN** the response returns the same URL with the `https://` scheme

### Requirement: Unknown product
A well-formed `:id` that the upstream does not know MUST produce `404` with the
`ApiError` shape.

#### Scenario: Unknown id
- **WHEN** the id is well-formed but no product matches it upstream
- **THEN** the response is `404` with the `ApiError` shape
