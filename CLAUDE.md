# CLAUDE.md

This repository is a conference demo: one online shop back office built from React, Vue,
Angular 16, a current Angular and plain JavaScript, all exchanging data on one page through
custom elements. The audience reads the code on screen, so the code must be clean and obvious.

- [docs/architecture.md](docs/architecture.md): the apps, the rules, the contracts.
- [docs/showcase.md](docs/showcase.md): the live demo script.
- `docs/guides/<app>.md`: how each app is built, added in the stage that builds it.

The parent folder (`../`, the original `acme-*` / `corvane` prototype and its `docs/`) is
reference material only. Read it for ideas, never edit it, and never copy its old names in here.

## Rules

1. **Never change a contract.** Tag, attribute, property and event names, `detail` shapes,
   theme tokens and ports are listed in [docs/architecture.md](docs/architecture.md#contracts).
2. **Never commit to `main`.** Each stage is built on its own branch `feature/<what we built>`.
   When a stage is done, stop and let the user review it. Commit and push only when the user
   says so. Pull requests are opened from the feature branch into `main`.
3. **No comments in code.** Names carry the meaning. Explanations belong in `docs/`.
4. **No test suites.** Verify each stage yourself (lint, typecheck, build, open it in a browser),
   but do not commit test files.
5. **Show data with `textContent`**, never `innerHTML`, `dangerouslySetInnerHTML`, `v-html`
   or `[innerHTML]`.
6. **Every folder is an independent npm project** with its own `package.json`, `node_modules`
   and `package-lock.json`. No workspaces, no root `package.json`.
   Keep dependencies few and well known; prefer a few lines of our own code to an unfamiliar package.
   **Order of work for every project:** write `package.json` first, stop and let the user review
   every dependency, let the user install, then write the code.
   **The user runs every `npm` and `npx` command** (install, ci, run, scaffolders such as
   `ng new`), on the host and in containers. Give the exact command and folder, then wait.
   Docker image builds that run `npm ci` from a reviewed `package-lock.json` are fine.
7. **Strict TypeScript** (`"strict": true`) in every TypeScript project. Plain JavaScript only
   where the point is "no build": `examples/`, `packages/ui`, `apps/backoffice-vanilla`.
8. **ESLint** in every project (`npm run lint`), with each framework's recommended flat config.
   **No Prettier.** Formatting is VS Code's built-in formatters, set in the committed
   `.vscode/settings.json` (format on save, single quotes, semicolons), plus `.editorconfig`.
   Write code in that style: 2-space indent, single quotes, semicolons, lines under ~100 chars.
9. **Latest stable versions**, except `apps/backoffice-angular16`, which stays on Angular 16
   with Zone.js, `*ngIf`, `@Input()` and `standalone: true` on purpose.
10. When a guide's code does not work with the installed version, fix it minimally and update
    the guide in the same change.
11. **Everything runs through Docker.** Each app has its own `Dockerfile` and a service in the
    root `docker-compose.yml`, added in the stage that builds the app. Run and verify apps only
    with `docker compose`, never with a server started on the host. `npm install` on the host is
    fine: it keeps `package-lock.json` current and gives the editor its types.

## Layout and ports

| Folder | What | Port | Compose service |
| --- | --- | --- | --- |
| `tools/mock-api` | Orders REST API (Express, TypeScript run directly by Node) | 3000 | `mock-api` |
| `examples/web-components-basics` | Native Web Components warm-up | 4100 | `web-components-basics` |
| `packages/ui` | `@shop/ui` design system (`ui-*`) | 4300 | `ui` |
| `apps/orders` | Angular remote (`shop-orders-list`, `shop-order-detail`) | 4201 | `orders` |
| `apps/insights` | React remote (`shop-order-stats`, `shop-activity-feed`) | 4202 | `insights` |
| `apps/notes` | Vue remote (`shop-status-filter`, `shop-order-notes`) | 4402 | `notes` |
| `packages/orders-elements` | `@shop/orders-elements`, built from `apps/orders` | none | built inside the `backoffice-vanilla` image |
| `apps/backoffice-react` | React host | 4200 | `backoffice-react` |
| `apps/backoffice-vue` | Vue host | 4400 | `backoffice-vue` |
| `apps/backoffice-angular16` | Angular 16 host (`node:18` image) | 4500 | `backoffice-angular16` |
| `apps/backoffice-vanilla` | Plain JavaScript host with a strict CSP | 4600 | `backoffice-vanilla` |

```bash
docker compose up --build --watch        # everything, edits sync into the containers
docker compose up --build --watch orders # one service and what it depends on
docker compose down                      # stop everything
docker compose up -d --force-recreate mock-api   # back to the seed data
```

Inside every image the app starts with `npm start`. Dev servers must listen on `0.0.0.0`.
Use Compose Watch (`develop.watch`), not bind mounts, so edits on Windows reach the container.

## Stages

Each stage is one branch and one pull request, and ends with something that runs in Docker:
every app arrives with its `Dockerfile` and its `docker-compose.yml` service.

| # | Branch | Adds | Done when |
| --- | --- | --- | --- |
| 1 | `feature/foundation` | README, CLAUDE.md, architecture and demo docs, VS Code settings, `tools/mock-api`, `docker-compose.yml` | container is healthy; `/orders` returns 5, `?status=open` returns 3, PATCH works, recreating the container restores the seed |
| 2 | `feature/ui-kit` | `packages/ui`, `examples/web-components-basics` | both demo pages work; `ui.js` loads from 4300 |
| 3 | `feature/orders` | `apps/orders` | harness lists orders, row click fills the detail, "Mark as shipped" updates the list; `remoteEntry.json` exposes `./elements`; no `zone.js` |
| 4 | `feature/insights` | `apps/insights` | `insights-elements.js` loads; tiles and feed work in the harness |
| 5 | `feature/backoffice-react` | `apps/backoffice-react` | dashboard, `/orders` master-detail, deep link, theme switch, error card |
| 6 | `feature/notes-and-backoffice-vue` | `apps/notes`, `apps/backoffice-vue` | `notes-elements.js` loads; Vue host shows Angular + React + Vue |
| 7 | `feature/backoffice-angular16` | `apps/backoffice-angular16` | demo steps 3, 4 and 6 pass; two `ng-version` values on one page |
| 8 | `feature/orders-package-and-vanilla` | `packages/orders-elements`, `apps/backoffice-vanilla`, package option in `backoffice-react` | demo step 7 passes; only `localhost:4600` scripts; no CSP errors |
| 9 | `feature/demo-images` | `docker-compose.demo.yml`: production builds served by nginx | the whole demo script passes against the built images |
| 10 | `feature/run-scripts` | Windows `.bat` shortcuts in `scripts/` around `docker compose` | `start-all.bat`, `stop-all.bat` and `open-demo.bat` work |

## Known pitfalls

| Symptom | Fix |
| --- | --- |
| CORS error loading `remoteEntry.json` | Add `Access-Control-Allow-Origin: *` to the `serve` options of `apps/orders` |
| `Failed to resolve component: shop-...` in Vue | Set `isCustomElement` for `ui-` and `shop-` tags in the Vite Vue plugin |
| React remote: `process is not defined` | Keep the `define` block for `process.env.NODE_ENV` in the library build |
| Angular 16: "Module not found" for a URL import | Write `import(/* webpackIgnore: true */ url)`; this is the one allowed comment, webpack needs it |
| Angular 16 CLI refuses to run | Its image must be `node:18`; run its `npm`/`ng` commands in that container, not on the host |
| Page does not load on `localhost:<port>` | The dev server listens on `127.0.0.1` inside the container: start it with `--host 0.0.0.0` |
| Edits do not reach the container | Start with `--watch`, and check the service's `develop.watch` paths |
| `esbuild` or `rollup` binary errors in a container | Host `node_modules` leaked in: keep `node_modules` in every `.dockerignore` |
| An event never arrives | Event names are case-sensitive, and the listener must be on the element itself |
| The activity feed does not update | Assign a new array to `entries`; never mutate it |
| Native Federation `ng add` fails | On Angular 20 or 21 the package is `@angular-architects/native-federation-v4`; on 22+ it is `@angular-architects/native-federation` |
| `npm ci` fails with `EINTEGRITY` in `backoffice-vanilla` | The package was rebuilt without a new version: bump it in `packages/orders-elements/package.json`, repack, reinstall |
