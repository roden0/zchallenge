# Proposal

## Why

The BFF currently serves only `GET /health`, so the web app has no way to obtain
product data. The BFF is the only component allowed to call the upstream phones
API, so the read-only product routes the catalog and the detail view need must
land here first, while keeping the API key server-side and giving the web app a
stable, normalized contract.

## What Changes

- Add `GET /api/products?search=&limit=&offset=` (list) and `GET /api/products/:id`
  (detail), both returning JSON and both using the `ApiError` shape on failure.
- Validate configuration at startup and fail fast: `UPSTREAM_API_KEY` and
  `UPSTREAM_API_URL` are required and the URL must be absolute `http`/`https`;
  `UPSTREAM_TIMEOUT_MS` defaults to 15000 ms and `PORT` to 3001.
- Add an injectable upstream client using Node 18 `fetch` with `AbortSignal.timeout`,
  payload type guards, and pure helpers for query parsing, deduplication, image URL
  normalization and `similarProducts` cleanup.
- Map errors so the client never sees an upstream `401` as its own: invalid client
  input → `400`, unknown product or route → `404`, timeout → `504`, any other
  upstream failure, network failure or malformed payload → `502`, unexpected
  exception → `500`. Never expose the key in responses, logs or error messages.
- Add a types-only `packages/contracts` workspace package so `web` and `bff` share
  the `ProductSummary`, `ProductDetail` and `ApiError` types with no runtime code.
- Add the `/api` dev proxy to `apps/web/rsbuild.config.mts` (configuration only, no
  product code) so the browser talks to the BFF without CORS.
- Recreate `.env.example` with placeholders and update `docs/api-notes.md` with the
  facts verified during this change.

## Capabilities

### New Capabilities

- `bff-upstream-access`: how the BFF authenticates to, times out, validates and
  classifies failures from the upstream API, and how it maps every failure to the
  `ApiError` contract without leaking the key.
- `bff-products-list`: behavior of `GET /api/products`: query parameter validation,
  forwarding only `search`, deduplicating before pagination, normalizing image URLs
  and returning a plain array.
- `bff-product-detail`: behavior of `GET /api/products/:id`: id validation, the
  `ProductDetail` response with untouched numbers, reference cleanup and `404` for
  an unknown id.

### Modified Capabilities

None. No existing capability's requirements change.

## Impact

- **Code:** `apps/bff` gains config validation, an upstream client, routes, error
  middleware, pure helpers and tests; `apps/web/rsbuild.config.mts` gains the `/api`
  dev proxy (no product code).
- **Packages / tooling:** new `packages/contracts` (types only). This is the one
  deliberate tooling change: `pnpm-workspace.yaml` adds `packages/*` and both apps
  gain a dependency on the package. `setup-monorepo-tooling` is otherwise untouched.
- **Docs:** `docs/api-notes.md` (verified facts, `[VERIFY]` marks removed) and a
  recreated `.env.example` (placeholders only, no loader).
- **Dependencies:** none added. The upstream client uses the built-in `fetch`; tests
  use a local `http` server instead of a mocking library.
- **Config / secrets:** `UPSTREAM_API_KEY`, `UPSTREAM_API_URL`, optional
  `UPSTREAM_TIMEOUT_MS` and `PORT`. The key stays in the BFF environment only.
