# Proposal

## Why

The repository is an empty shell: a root `package.json` whose only script fails, no
workspace, no apps, no linter, no tests and no CI. Nothing can be built, checked or
run yet, so no product change can start. On top of that, the existing
`devEngines.packageManager` pins pnpm `^11.5.1`, which requires Node.js 22+; the
challenge mandates Node 18, so the current pin makes the repo uninstallable on the
target runtime. This change lays the runnable foundation first, deliberately with no
product features.

## What Changes

- Add a pnpm workspace (`pnpm-workspace.yaml`) with Turborepo (`turbo.json`) orchestration.
- Add `apps/web`: React 19 + TypeScript SPA built with Rsbuild, with a minimal placeholder entry.
- Add `apps/bff`: Express 5 + TypeScript server on Node 18 with a minimal `GET /health` route and an environment config module.
- Add shared tooling: Biome (lint + format), a strict `tsconfig.base.json` extended by both apps, and a root `.gitignore`.
- Add the root scripts from `AGENTS.md`: `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `test`.
- Add test harnesses with one trivial passing test each: Jest + React Testing Library in `web`, Mocha + Chai in `bff`.
- Make development serve **unminified** assets and the production build **concatenate and minify** them (Rsbuild development vs production modes).
- Pin every dependency to a version that supports Node 18, and **BREAKING** change the package-manager pin from pnpm `^11.5.1` to pnpm `^10.33.4` (last line supporting Node 18). Declare `engines.node`.
- Add a short root `README.md` that documents the BFF's `UPSTREAM_API_URL` / `UPSTREAM_API_KEY` environment variables (no real key is committed, and no example file is shipped).
- Add a minimal GitHub Actions workflow running lint, typecheck and tests on Node 18.

## Capabilities

### New Capabilities

None. This is a pure tooling and scaffolding change: it establishes the build and
test environment but changes no product behavior, so there is no spec-level
behavior to define. The change opts out of specs with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- **Config:** root `package.json` (scripts, `engines`, package-manager pin), new
  `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `biome.json`, `.gitignore`, `.nvmrc`.
- **Code:** new `apps/web` and `apps/bff` packages (minimal, feature-free).
- **Dependencies:** introduces the pinned toolchain; all versions chosen for Node 18.
- **CI:** new `.github/workflows/ci.yml`.
- **Docs:** root `README.md`.
- **Lockfile:** regenerated under pnpm 10; the stray pnpm 11 lockfile is replaced.
- **Risk:** Node 18 is end-of-life; tooling is pinned to compatible older majors
  (Rsbuild 1.x, Mocha 11, jest-dom 6.9.1) that will not receive new features.
