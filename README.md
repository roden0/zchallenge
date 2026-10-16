# Zara Challenge

Mobile phone catalog web app (technical challenge). A pnpm + Turborepo
monorepo with a React SPA that talks only to an Express BFF; the BFF is the only
service that calls the upstream phones API.

This repository contains the tooling foundation plus three product views:
the catalog list (`/`), the product detail (`/products/:id`) and the cart
(`/cart`).

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

## Product detail

The `/products/:id` view (feature `apps/web/src/features/product-detail`) fetches
`GET /api/products/{id}` through the BFF and renders four states:

- **Loading** — `LOADING...` in a `role="status"`, document title `Product | MBST`.
- **Loaded** — title `{name} | MBST`, image, storage and color selector groups,
  the shared price and the add-to-cart button, plus a `SPECIFICATIONS` table.
- **Not found** (BFF `404`/`400`) — `PRODUCT NOT FOUND`, title `Product not found | MBST`.
- **Error** — `COULD NOT LOAD PRODUCT` in a `role="alert"` with a `RETRY`
  button; the raw upstream message or status is never shown.

Storage and color are native radio groups with nothing pre-selected, so the add
button stays disabled until both are chosen. The displayed price comes from the
selected storage option (`From {basePrice} EUR` before choosing) and the image
follows the selected color. Adding appends a cart line through the shared cart,
so repeated adds create separate lines.

Known **[CONFIRM]** values: the specifications label column is `300px` on desktop
and tablet and fluid on mobile, and the row height is ≈`46px`.

## Cart

Cart state lives in the web app (`apps/web/src/shared/cart`), is persisted in
`localStorage` under the key `mbst:cart:v1`, and syncs across tabs. Known
limitations:

- **Prices are snapshots.** A line stores the price at the time it was added and
  is never revalidated against the API, so a stored total can go stale if the
  upstream price changes.
- **No quantity control.** Every add creates its own line (`lineId`); the
  header count is the number of lines.
- Stored cart data is validated on read; invalid entries are dropped and the
  app keeps working in memory if storage is unavailable.

## Node 18 trade-off

The challenge mandates Node 18, which is end-of-life. Every pinned tool version
is the newest that still supports Node 18.18 — pnpm 10 instead of 11,
`@rsbuild/core` 1.x instead of 2, Mocha 11 instead of 12, and
`@testing-library/jest-dom` pinned to `6.9.1`. These lines no longer receive new
features; raising the runtime later means unpinning them.
