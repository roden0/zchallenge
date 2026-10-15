# Zara Challenge

Mobile phone catalog web app (technical challenge). A pnpm + Turborepo
monorepo with a React SPA that talks only to an Express BFF; the BFF is the only
service that calls the upstream phones API.

This repository currently contains the runnable tooling foundation only. No
product features are implemented yet.

## Prerequisites

- **Node.js 18.18+** (the challenge mandates Node 18). See `.nvmrc`.
- **pnpm 10** (pinned through `devEngines.packageManager`; pnpm installs it
  automatically). On a fresh machine, enable Corepack or install pnpm 10 to
  bootstrap.

## Install

```bash
pnpm install
```

## Scripts

Run from the repository root:

| Script | What it does |
|---|---|
| `pnpm dev` | Runs the web dev server and the BFF in watch mode (unminified). |
| `pnpm build` | Production build: concatenated and minified assets in `apps/web/dist`, compiled BFF in `apps/bff/dist`. |
| `pnpm start` | Serves the production build (`rsbuild preview` + `node dist/index.js`). |
| `pnpm lint` | Biome check (lint + format) over the whole repo. |
| `pnpm format` | Biome format with `--write`. |
| `pnpm typecheck` | `tsc --noEmit` in every package. |
| `pnpm test` | Jest + React Testing Library (web), Mocha + Chai (BFF). |

Each script maps 1:1 to `package.json` at the root.

## Dev vs production

- `pnpm dev` serves **unminified** assets with readable module sources and no
  hashing, for fast iteration and debugging.
- `pnpm build` produces **concatenated, minified** assets with content-hashed
  filenames (Rspack module concatenation + SWC minification).

## Environment

The BFF reads `UPSTREAM_API_URL` and `UPSTREAM_API_KEY` from the process
environment. No `.env` loader is wired up yet (no upstream call lands in this
foundation change), so export the variables in your shell when you need them.
`.env` is git-ignored for when a loader is added; the key is never sent to the
browser.

```
UPSTREAM_API_URL=
UPSTREAM_API_KEY=
```

## Layout

```
apps/web   React 19 + TypeScript + Rsbuild SPA (Jest + RTL)
apps/bff   Express 5 + TypeScript on Node 18 (Mocha + Chai)
```

## Node 18 trade-off

The challenge mandates Node 18, which is end-of-life. Every pinned tool version
is the newest that still supports Node 18.18 — pnpm 10 instead of 11,
`@rsbuild/core` 1.x instead of 2, Mocha 11 instead of 12, and
`@testing-library/jest-dom` pinned to `6.9.1`. These lines no longer receive new
features; raising the runtime later means unpinning them.
