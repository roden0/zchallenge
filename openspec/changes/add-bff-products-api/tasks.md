# Tasks

## 1. Verify the upstream contract against the real API

- [x] 1.1 With `UPSTREAM_API_KEY` exported in the environment (never written anywhere), call the live API and record in `docs/api-notes.md`: (a) that every image URL (list `imageUrl`, `colorOptions[].imageUrl`, `similarProducts[].imageUrl`) answers `200` over `https://`, and whether images require the key; (b) whether `similarProducts` contains the product itself or repeated ids; (c) `search` with a brand-only term (`apple`), a name-only term (`iphone`) and a no-match term (`zzzz`) - status and body; (d) `limit` combined with `search`. Verify each finding is written down and the matching `[VERIFY]` marks are removed.
- [x] 1.2 Confirm the https-image decision: if any image URL does not serve `200` over `https://`, or the no-match search is not `200` with `[]`, or any response deviates from the shapes in `docs/api-notes.md`, STOP and propose changes to `design.md` and the specs before continuing. Verify by writing the outcome (proceed, or the proposed change) into `design.md`.

## 2. Shared contracts package

- [x] 2.1 Create `packages/contracts` (types only, no runtime code) exporting `ProductSummary`, `ColorOption`, `StorageOption`, `ProductSpecs`, `ProductDetail` and `ApiError`, with its own `package.json` and `tsconfig.json`. Add `packages/*` to `pnpm-workspace.yaml` and add the dependency to `apps/bff/package.json` and `apps/web/package.json`. Verify `pnpm install` exits 0 and `pnpm typecheck` resolves the new package from both apps.
- [x] 2.2 Wire both apps' `tsconfig` to consume the package and add a smoke import in `apps/bff/src` so a broken reference fails typecheck. Verify `pnpm typecheck` passes.

## 3. Config module

- [x] 3.1 Replace `apps/bff/src/config.ts` with validated loading: require `UPSTREAM_API_URL` (absolute `http`/`https`) and `UPSTREAM_API_KEY` (non-empty), default `UPSTREAM_TIMEOUT_MS` to 15000 and `PORT` to 3001, and throw an error naming the offending variable without printing its value.
- [x] 3.2 Add `config.test.ts` covering: missing key, missing URL, non-absolute/invalid URL, applied defaults, and that no thrown message contains the key value. Verify `pnpm --filter bff test` passes.

## 4. Upstream client

- [x] 4.1 Implement `services/upstream-client.ts` as `createUpstreamClient({ baseUrl, apiKey, timeoutMs, fetch })`: send `x-api-key`, use `AbortSignal.timeout`, classify results (`401` → bad gateway, other non-2xx → bad gateway, timeout → gateway timeout, `404` → not found, network failure → bad gateway), and validate payloads with type guards (mismatch → bad gateway).
- [x] 4.2 Add `upstream-client.test.ts` against a local `http` server started in the test, using a distinctive fake key: assert the `x-api-key` header, the exact upstream path and query, that only `search` is forwarded, timeout → `504`, a closed port → `502`, upstream `401` → `502` with no key in the body or logs, upstream `404` → `404`, and a malformed payload → `502`. Verify `pnpm --filter bff test` passes.

## 5. Pure helpers

- [x] 5.1 Implement pure helpers in `apps/bff/src/lib/`: query parameter parsing/validation (`search` trim + 100-char cap, `limit` integer ≥1 clamped to `MAX_LIMIT` 100, `offset` integer ≥0 default 0, repeated known param and unknown param handling), dedupe by `id` keeping first, image URL http→https normalization for the upstream host, and `similarProducts` cleanup (dedupe and remove the requested product).
- [x] 5.2 Add unit tests for each helper covering the cases in the delta specs (empty/over-long search, invalid and clamped limit, invalid offset, repeated and unknown params, duplicate id once, distinct-count limit, http rewrite, similar dedupe and self-exclusion). Verify `pnpm --filter bff test` passes.

## 6. Routes and error middleware

- [x] 6.1 Implement `routes/products.ts` for `GET /api/products` and `GET /api/products/:id`, a router mounted under `/api`, a catch-all `404` handler, the request logger middleware, and the final error handler (`500` with no stack). Validate `:id` against `^[A-Za-z0-9_-]{1,64}$` and URL-encode it upstream.
- [x] 6.2 Add route tests through `createApp({ upstream, logger })` with an injected fake upstream and a silent logger: list success, search forwarded and trimmed, empty search omitted, offset and limit applied after dedupe, limit above `MAX_LIMIT` clamped, invalid limit/offset, repeated param, unknown params dropped, duplicate id once, no matches → `[]`, image URLs rewritten; detail success with decimals untouched, `similarProducts` deduped and without the product itself, detail images rewritten, invalid id → `400`, unknown id → `404`; unknown route → `404` with the `ApiError` shape; forced unexpected exception → `500` with no stack in the body. Verify `pnpm --filter bff test` passes.

## 7. Entry point and dev proxy

- [x] 7.1 Rewire `apps/bff/src/index.ts` to read and validate config, construct the upstream client and logger, build the app and start listening (no other module has side effects).
- [x] 7.2 Add the `/api` proxy to `apps/web/rsbuild.config.mts` targeting the BFF (`http://localhost:3001`), with no product code changes. Verify with both dev servers running that a browser request to `/api/products` reaches the BFF and no CORS error appears in the console.

## 8. Environment example and notes

- [x] 8.1 Recreate `.env.example` with placeholder values only (`UPSTREAM_API_URL`, `UPSTREAM_API_KEY`, optional `UPSTREAM_TIMEOUT_MS`, `PORT`), matching the config module. Verify no real key appears anywhere in the tree and `.env` stays git-ignored.
- [x] 8.2 Finalize `docs/api-notes.md`: replace the "Still to check" and "BFF contract (proposed)" sections with the verified facts and the now-implemented contract. Verify every former `[VERIFY]` item is resolved or explicitly marked unresolved.

## 9. Integration check

- [x] 9.1 Run `pnpm lint`, `pnpm typecheck` and `pnpm test` on Node 18 and confirm all pass.
- [x] 9.2 Against the running BFF, smoke test with `curl`: `limit=20` returns 20 distinct ids, `search=sam` returns 6 products, the duplicated id (`XMI-RN13P5G`) appears once, an unknown id returns `404`, an invalid `limit` returns `400`, and the API key appears in no response body or log line. Report exactly what was run and what was not.

## Workflow follow-up

- Archive the change after the proposal and implementation are reviewed and merged.
