# Design

## Context

See `proposal.md` - Why. The constraints that shape the approach:

- `setup-monorepo-tooling` established `apps/bff` as an ESM package (`"type": "module"`,
  `NodeNext`) with Express 5, Mocha + Chai via `tsx`, Jest/RTL in `web`, and a strict
  `tsconfig.base.json`. This change builds on that layout; it does not revisit it.
- The challenge mandates **Node 18**. Node 18 ships a global `fetch` and
  `AbortSignal.timeout`, but both are behind experimental flags there.
- The upstream API is the only source of product data; its key must never reach the
  browser, logs, commits or specs. The web app talks only to the BFF.
- `workspace` currently includes only `apps/*`; there is no cross-app package yet.
- `docs/api-notes.md` documents the upstream contract and holds the remaining `[VERIFY]`
  items this change must confirm before the image-URL behavior is fixed.

## Goals / Non-Goals

**Goals:**

- Two read-only routes, `GET /api/products` and `GET /api/products/:id`, with
  behavior fully described by the three delta specs.
- A BFF that is testable without touching the network: injectable upstream client and
  logger, pure helpers for all transformations.
- One shared, runtime-free source of truth for the payload types used by both apps.

**Non-Goals:**

- No caching, rate limiting, BFF authentication, CORS handling, SSR or deployment.
- No product/UI code in `apps/web`; only the dev proxy config is touched.
- No new runtime dependency: no `undici`, `supertest`, `nock`, `helmet`, logger library
  or `dotenv` (see Open Questions).

## Decisions

### D1. App and upstream construction are explicit and side-effect free

`createApp({ upstream, logger })` builds and returns the Express app; it starts no
listener and reads no environment. `createUpstreamClient({ baseUrl, apiKey, timeoutMs,
fetch })` receives `fetch` as a parameter and returns the client. `index.ts` is the only
module with side effects: it loads and validates config, constructs the client and the
logger, builds the app, and calls `listen`. This keeps every unit testable in isolation
and lets tests inject a fake `fetch` or a local server without module stubbing.

### D2. HTTP calls use the Node 18 built-in `fetch` with `AbortSignal.timeout`

No HTTP client dependency is added; the runtime already provides one. The request is
issued with `signal: AbortSignal.timeout(timeoutMs)`; a `TimeoutError`/abort maps to
`504 GATEWAY_TIMEOUT`. Node 18 prints an `ExperimentalWarning` for `fetch`; that warning
is acceptable and is not suppressed. Rejected alternatives: `undici` (extra dependency
for behavior the platform already has) and `node-fetch` (older, unmaintained relative to
the platform).

### D3. Express 5 (already pinned), with `x-powered-by` disabled

`express` `^5.3.0` is already installed. Express 5 forwards a rejected promise from an
async route handler to the error middleware, so handlers stay `async` without a
`try/catch` wrapper or an async-handler helper. `app.disable("x-powered-by")` removes the
framework fingerprint. Rejected alternative: Express 4 (would mean downgrading the pin
established by the tooling change).

### D4. Folder layout under `apps/bff/src`

- `config/` - environment reading and validation (fails fast).
- `services/` - the upstream client (`upstream-client.ts`) and its error classification.
- `lib/` - pure helpers: query parsing, dedupe, image URL normalization, similar-product
  cleanup, and the payload type guards. No I/O, each testable alone.
- `middleware/` - the request logger and the final error handler.
- `routes/` - `products.ts` (list + detail), `index.ts` (router), plus a catch-all `404`.
- `app.ts` / `index.ts` - factory and entry point.

### D5. TypeScript contracts live in a types-only workspace package

Add `packages/contracts` containing only the `ProductSummary`, `ColorOption`,
`StorageOption`, `ProductSpecs`, `ProductDetail` and `ApiError` types (no runtime code,
so it disappears at build time). Both apps depend on it, so the BFF response and the web
client cannot drift. **Cost:** this is the one tooling change - `pnpm-workspace.yaml`
adds `packages/*`, the package gets a `package.json` and `tsconfig.json`, and both apps
gain a dependency edge and a `tsconfig` reference. Rejected alternatives: duplicating the
types in each app (drift) and exporting them from `apps/bff` (web would import server
code).

### D6. Web reaches the BFF by proxying `/api`

In dev, `apps/web/rsbuild.config.mts` proxies `/api` to the BFF (`http://localhost:3001`),
so the browser sees one origin and no CORS is involved. The BFF routes are therefore
prefixed with `/api`. In production the same origin is reused (the tooling change already
builds both apps); no CORS middleware is added. Rejected alternative: enabling CORS on the
BFF and calling it cross-origin, which would add configuration and expose the service more
broadly than needed.

### D7. Logging is a minimal injectable interface

`Logger` is a one-method interface (`info(fields)`); the default implementation writes a
single line per request with method, path, status and duration. Tests pass a silent
logger. The logger never receives the API key or request headers, so the key cannot leak
through it. Rejected alternative: a logging library, which is more than the one line this
needs.

### D8. Deduplication and pagination happen in the BFF

The upstream list has no dedupe and no total count, and `search` is the only parameter the
challenge needs. The BFF forwards only `search`, validates the payload, deduplicates by
`id` keeping the first occurrence, then applies `offset`, then `limit`. Dedupe must run
before `limit`: applying `limit` first would let a duplicate consume a slot and return
fewer than `limit` distinct products. Rejected alternative: forwarding `offset`/`limit`
upstream, which cannot deduplicate across the window and would need a stable upstream
order it does not guarantee.

### D9. Image URLs are normalized to `https` after confirming it serves them

An `imageUrl` whose host equals the upstream host and whose scheme is `http` is rewritten
to `https`. This is conditional on the first task confirming that `https://` serves the
same images (and whether they require the key); if it does not, the behavior is revisited
in this change before the specs are frozen. Rejected alternative: leaving mixed-content
`http` URLs, which browsers block or warn about once the app is served over HTTPS.

Verified 2026-10-15: every image URL (list, colors, similar) answers `200` over `https://`
on the upstream host and images need no API key, so the rewrite stands. The same run also
confirmed the gate for the other task-1 checks: `search=zzzz` returns `200` with `[]`, and
all list/detail payloads match the documented shapes, so implementation proceeds.

### D10. Configuration is validated once, at startup, and never printed

`loadConfig(env)` returns a validated, typed config or throws an error naming the missing
or invalid variable without its value. `UPSTREAM_TIMEOUT_MS` defaults to 15000 ms (the
upstream is on Render and may cold start) and `PORT` to 3001. No `.env` loader is added;
the process reads the ambient environment and `.env.example` is documentation only, as
decided in `setup-monorepo-tooling` (D7 there).

## Risks / Trade-offs

- **`https` images not served** → Task 1 checks every image URL before the behavior is
  locked; if it fails, stop and revise D9 and the specs before continuing.
- **Node 18 `ExperimentalWarning` for `fetch`** → Accepted and documented; no suppression,
  no dependency.
- **Payload guard strictness** → Guards check the fields the BFF relies on and required
  shapes, not every optional field, so a benign upstream addition does not turn into a
  `502`; anything structurally wrong still does.
- **Shared package adds wiring** → The types-only package adds a workspace glob and a
  dependency edge in each app; in exchange the two apps share one contract. Called out in
  the proposal and here because it is the one tooling change.
- **Deduplication and pagination over the full list** → The BFF reads all matching
  products per request because there is no total count and dedupe precedes `limit`;
  acceptable at this catalog size, revisit if the upstream grows (a `ponytail:` note at
  the call site).

## Open Questions

These would each add a dependency; none is required by the specs. Confirm only if wanted:

1. `supertest` or `nock` for route tests - tests use a real local `http` server instead.
2. `undici` for a non-experimental `fetch` on Node 18 - the built-in `fetch` is used.
3. `helmet` for security headers - not a graded requirement.
4. A logger library (pino) - the inline injectable logger is used.
5. `dotenv` - the process reads the ambient environment; `.env.example` is documentation.
