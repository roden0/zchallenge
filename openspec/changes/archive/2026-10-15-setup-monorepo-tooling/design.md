# Design

## Context

See `proposal.md` for motivation. The constraints that shape the approach:

- The challenge mandates **Node 18** and `AGENTS.md` requires that every pinned tool
  version support it. Node 18 is end-of-life (April 2025), so the newest releases of
  several tools are unusable here: pnpm 11 (needs Node 22+), `@rsbuild/core` 2.x and
  Mocha 12 (need Node 20+), `@testing-library/jest-dom` 7 and `jsdom` 30 (need Node 22+).
- The repository is greenfield (no apps), so there is no existing convention to follow;
  this change sets the conventions for everything after it.
- The root `package.json` currently pins pnpm `^11.5.1`, which contradicts the Node 18 mandate.
- Graded outcomes that this foundation must make possible: clean browser console,
  linting/formatting, tests, and distinct dev (unminified) and production
  (concatenated + minified) modes.

## Goals / Non-Goals

**Goals:**

- One install (`pnpm install`) and one set of root scripts that run on Node 18.
- Dev serves unminified assets; the production build concatenates and minifies.
- A lint/typecheck/test baseline that is green and fast, with one real passing test per app.
- Keep the apps feature-free and minimal so later changes add behavior, not tooling.

**Non-Goals:**

- No product features, styling, routing, SSR or deployment (see proposal).
- No shared UI/data package yet; `apps/web` and `apps/bff` stay independent.
- No upstream API calls, so no `.env` loading mechanism is added yet (see D7).
- No coverage thresholds, E2E or visual tests in this change.

## Decisions

### D1. Pin the toolchain to the last Node-18-compatible release of each tool

Latest majors break Node 18 (see Context). Pin the newest majors that still declare
Node 18 support. Rejected alternative: use latest versions and require Node 20+,
which violates the mandate; rejected because the deliverable must run on Node 18.

| Tool | Pin | Declared engines |
|---|---|---|
| pnpm | `^10.33.4` | ≥18.12 |
| turbo | `^2.11.8` | core is Node-version independent |
| @biomejs/biome | `^2.5.15` | ≥14.21 |
| typescript | `5.9.3` | ≥14.17 |
| @types/node | `^18.19.130` | matches the 18 runtime |
| react / react-dom | `^19.3.1` | ok |
| @rsbuild/core | `1.7.6` | ≥18.12 |
| @rsbuild/plugin-react | `1.4.6` | matches core 1.x |
| jest / jest-environment-jsdom | `^30.5.2` | ^18.14 |
| ts-jest | `^29.4.15` | supports jest 30, ts <7 |
| @testing-library/react | `^16.3.3` | ≥18 |
| @testing-library/dom | `^10.4.2` | ≥18 (RTL 16 peer) |
| @testing-library/user-event | `^14.6.8` | ≥12 |
| @testing-library/jest-dom | `6.9.1` (exact) | ≥14; 6.10.0 jumps to ≥22 |
| express | `^5.3.0` | ≥18 |
| mocha | `11.8.0` | ^18.18 |
| chai | `^5.3.3` | ≥18 |
| tsx | `^4.23.15` | ≥18 |

The strictest constraint is Mocha 11.8 (`^18.18.0`), so `engines.node` is `>=18.18.0`.

### D2. Switch the package manager from pnpm 11 to pnpm 10

pnpm 11 requires Node 22+ and is pure ESM. pnpm 10.33.x is the last line supporting
Node 18.12+. Rejected alternative: keep pnpm 11 and run it with a Node 22 dev
environment while only the BFF runs on Node 18 — rejected because install/CI on a
Node 18 machine would fail. Implemented by changing the existing
`devEngines.packageManager` version to `^10.33.4`; pnpm's `onFail: download`
provisions the pinned version.

### D3. Rsbuild 1.7.6 instead of Rsbuild 2.x

Rsbuild 2 requires Node ≥20.19; 1.7.6 requires ≥18.12 and pairs with
`@rsbuild/plugin-react` 1.4.6. Rejected alternatives: Rsbuild 2.x (violates Node 18)
and Vite (would mean diverging from the stack named in `AGENTS.md`).

### D4. Jest with the `ts-jest` transformer

`ts-jest` 29.4 supports Jest 30 and TypeScript <7, and needs no Babel config.
Rejected alternatives: `@swc/jest` (faster but adds `@swc/core` and skips type
checking) and `babel-jest` (more config and several Babel packages). The `web`
package stays CommonJS (`"type"` unset) so `ts-jest`'s default transform and jsdom
environment work without ESM flag gymnastics; Rsbuild still consumes ESM source.

### D5. `bff` is ESM and runs TypeScript with `tsx`

`bff` uses `"type": "module"`, `module`/`moduleResolution` `NodeNext`, and `tsx` for
`dev` and for running Mocha tests. This keeps one module system for source and tests,
avoids a separate build-step-to-test cycle, and lets `chai` 5 (ESM-only) be imported
directly. Rejected alternative: CommonJS + `ts-node` + `chai` 4 — more battle-tested
but requires pinning an older chai and mixes CJS with the ESM source style used in `web`.

### D6. Dev vs production minification comes from Rsbuild modes

`rsbuild dev` runs in development mode (unminified, in-memory) and `rsbuild build`
runs in production mode, where Rspack performs module concatenation (scope hoisting)
and SWC minification. No custom config is needed; the scripts map directly onto the
graded requirement. Rejected alternative: a hand-rolled build pipeline — unnecessary
because the bundler already implements both modes.

### D7. Document the environment variables but do not add a dotenv loader yet

No code calls the upstream API in this change, so no runtime needs the variables.
Adding `dotenv` now would be an unused dependency. The BFF `config` module reads
`process.env.UPSTREAM_API_URL` / `UPSTREAM_API_KEY` directly, and the root README
documents them. No example file is shipped; `.env` stays git-ignored for when a
loader lands. When the first upstream call lands, decide then whether to use
`node --env-file` (Node 18.20+) or add a loader. Rejected alternative: add
`dotenv` now (premature) or rely on `--env-file` (not guaranteed at the 18.18 floor).

### D8. Opt out of specs (`skip_specs: true`)

The change alters tooling, not observable product behavior, which the spec-driven
schema explicitly names as the case for opting out. The graded behaviors (scripts,
dev/prod modes, CI) are enforced by CI and the harness tests rather than by spec
requirements. Rejected alternative: a `developer-workflow` capability — possible, but
the project's spec rules are written for UI behavior (loading/empty/error, keyboard,
screen reader) and would not fit a tooling contract.

### D9. Workspace and task layout

`pnpm-workspace.yaml` includes `apps/*`. `turbo.json` defines `build`, `typecheck`
and `test` as cached tasks, and `dev`/`start` as persistent, cache-disabled tasks.
`lint` and `format` run Biome once at the root (it walks the whole tree), so they are
plain root scripts rather than Turbo tasks. Each app owns its `typecheck`/`test`
script so Turbo can parallelize and cache per package.

## Risks / Trade-offs

- **Node 18 is EOL** → Tooling is frozen on older majors that receive no features or
  fixes. Mitigation: `engines.node` documents the floor; a future change can raise the
  runtime and unpin when the challenge allows it.
- **`jest-dom` pinned to an exact `6.9.1`** because `6.10.0` raised its engine to
  Node ≥22. Mitigation: exact pin plus a comment; revisit if it is backported.
- **`tsx` loader option differs across Node versions** (`--import` on newer, `--loader`
  on Node 18) → The Mocha config must use the form that works at the 18.18 floor; the
  task verifies the test command on the declared minimum.
- **Native/binary dependencies** (turbo, `@rspack/core`, `@swc/core` via ts-jest) →
  CI runs on `ubuntu-latest` with Node 18 to catch platform mismatches.
- **Two module systems** (`web` CJS for Jest, `bff` ESM) → Recorded here so later
  contributors do not "fix" one to match the other without cause.

## Open Questions

None blocking. Whether to add a request proxy from the `web` dev server to the BFF, and
how to load env vars in dev, are deferred until the first change that makes a real
web→BFF call.
