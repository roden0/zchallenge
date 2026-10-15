# Tasks

## 1. Workspace root scaffolding

- [x] 1.1 Create the workspace root: `package.json` (private, `engines.node` `>=18.18.0`, `devEngines.packageManager` pnpm `^10.33.4`, all seven root scripts), `pnpm-workspace.yaml` (`apps/*`), `turbo.json`, `tsconfig.base.json` (`strict`), `biome.json`, `.gitignore` (`node_modules/`, `dist/`, `coverage/`, `.turbo/`, `.env*`), and `.nvmrc` (`18`). Verify with `pnpm install`: it exits 0 and the lockfile records pnpm `10.x`, not 11.
- [x] 1.2 Confirm no pinned dependency requires Node >18 by checking the declared `engines.node` of every direct dependency against the table in `design.md` (D1); record any mismatch instead of ignoring it.

## 2. apps/web application and build modes

- [x] 2.1 Create `apps/web` with `@rsbuild/core` 1.7.6 and `@rsbuild/plugin-react` 1.4.6, `react`/`react-dom` 19, `tsconfig.json` extending the base with `jsx: react-jsx` and DOM libs, `rsbuild.config.mts` (`.mts`, so Node's native TS loader treats it as ESM and does not warn in the CJS `web` package), `public/index.html` and a minimal `src/app/main.tsx` + `src/app/App.tsx` (placeholder heading only, no styling or routing). Verify `pnpm --filter web dev` serves the page and the shipped JavaScript is unminified.
- [x] 2.2 Verify the production path: `pnpm --filter web build` exits 0 and `dist` contains concatenated, minified JS (single-line, no development-only strings) and hashed asset filenames.

## 3. apps/web test harness

- [x] 3.1 Add Jest 30 + `jest-environment-jsdom` + `ts-jest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom` 6.9.1, a `jest.config.cjs`, a setup file importing `@testing-library/jest-dom`, and `App.test.tsx` rendering `<App />` by role and text. Verify `pnpm --filter web test` passes with no console errors or warnings.

## 4. apps/bff application

- [x] 4.1 Create `apps/bff` as ESM (`"type": "module"`, `NodeNext`) with `express` 5, `tsx`, `config.ts` reading `UPSTREAM_API_URL`/`UPSTREAM_API_KEY` from `process.env`, `app.ts` exporting a `createApp()` factory with `GET /health` returning `200`, and `index.ts` starting the server on a `PORT` env var (default 3001). Verify `pnpm --filter bff dev` starts and `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health` prints `200`.
- [x] 4.2 Add a `build` script (`tsc`) and verify `pnpm --filter bff build` emits `dist` and `node dist/index.js` serves `GET /health` with `200`.

## 5. apps/bff test harness

- [x] 5.1 Add `mocha` 11.8, `chai` 5, a `.mocharc` configured to load TypeScript via `tsx`, and `app.test.ts` that starts `createApp()` on an ephemeral port and asserts `GET /health` responds `200` using global `fetch`. Verify `pnpm --filter bff test` passes on the declared Node 18 floor (adjust the tsx loader form for Node 18 if `--import` is unsupported).

## 6. Environment example and README

- [x] 6.1 Document the BFF's `UPSTREAM_API_URL` / `UPSTREAM_API_KEY` variables in the README; verify no real key appears anywhere and that `.gitignore` excludes `.env` and `.env.*`.
- [x] 6.2 Add a root `README.md` documenting prerequisites (Node 18.18+, pnpm 10), install, the seven scripts, the dev-unminified vs production-minified distinction, and the Node 18 pinning trade-off. Verify the documented commands match `package.json` exactly.

## 7. CI workflow

- [x] 7.1 Add `.github/workflows/ci.yml` that checks out, sets up pnpm 10 and Node 18, installs with `--frozen-lockfile`, then runs `pnpm lint`, `pnpm typecheck` and `pnpm test`. Verify the YAML parses and the referenced scripts exist in the root `package.json` (GitHub Actions itself cannot be executed locally).

## 8. Root script wiring

- [x] 8.1 Wire `turbo.json` tasks (`build`, `typecheck`, `test` cached; `dev`, `start` persistent and cache-disabled) and confirm each root script resolves: `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test` and `pnpm build` each exit 0.

## 9. Integration check

- [x] 9.1 Run `pnpm lint`, `pnpm typecheck` and `pnpm test` together and confirm all pass; load the dev server in a browser and confirm the console has no errors or warnings; compare `pnpm dev` output (unminified) against `pnpm build` output (minified). Report exactly what was run and what was not.

## Workflow follow-up

- Archive the change after the proposal and implementation are reviewed and merged.
