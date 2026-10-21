# CLAUDE.md

This repository is a conference demo: one online shop back office, told in three acts.
The audience reads the code on screen, so the code must be clean and obvious.

1. **Pure Web Components:** `examples/web-components-basics`, the native API with no framework.
2. **Frameworks calling each other:** the latest Angular (`apps/microfrontends/orders`), React (`apps/microfrontends/insights`)
   and Vue (`apps/microfrontends/notes`) export custom elements; the React, Vue and Angular 16 shells use them
   all on one page. The Angular 16 shell hosts web components built with the latest Angular.
3. **A package instead of a server:** the Orders components are exported as
   `@shop/orders-elements` and installed into `apps/backoffices/backoffice-vanilla`, a page with no framework.

Every README, guide and demo step should make clear which act it belongs to.

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
   where the point is "no build": `examples/`, `apps/backoffices/backoffice-vanilla`.
8. **Each framework's default linter** behind `npm run lint`: ESLint with angular-eslint for
   Angular and the plain projects, oxlint (what `npm create vite` generates) for React and Vue.
   **No Prettier.** Formatting is VS Code's built-in formatters, set in the committed
   `.vscode/settings.json` (format on save, single quotes, semicolons), plus `.editorconfig`.
   Write code in that style: 2-space indent, single quotes, semicolons, lines under ~100 chars.
   **Interfaces start with `I`** (`IOrder`, `IOrdersConfig`, `IOrderSelectedDetail`) so a reader
   can tell an interface from a class (`OrdersService`, `OrdersClient`) at a glance. Type aliases
   (`OrderStatus`) and classes keep plain names.
9. **Latest stable versions**, except `apps/backoffices/backoffice-angular16`, the shell, which stays on
   Angular 16 with Zone.js, `*ngIf`, `@Input()` and NgModules (`AppModule`, `AppRoutingModule`, no standalone components)
   on purpose, the way most Angular developers know it. The Angular
   web components it hosts come from `apps/microfrontends/orders`, on the latest Angular.
10. When a guide's code does not work with the installed version, fix it minimally and update
    the guide in the same change.
11. **Everything runs through Docker**, following Docker's official guides
    (https://docs.docker.com/guides/angular/ and the equivalents for React and Vue). Each app has
    a `Dockerfile.dev` (dev server, Compose Watch) and a service in the root `compose.yaml`.
    No production images or `-prod` services. Run and verify apps only
    with `docker compose`, never with a server started on the host. `npm install` on the host is
    fine: it keeps `package-lock.json` current and gives the editor its types.

## Layout and ports

Apps that export custom elements live in `apps/microfrontends/`; the shells that host them live
in `apps/backoffices/`. A reader should see from the path which side an app is on.

| Act | Folder | What | Port | Compose service |
| --- | --- | --- | --- | --- |
| 1 | `examples/web-components-basics` | Three native Web Components | 4100 | `web-components-basics` |
| 2 | `apps/microfrontends/orders` | Latest Angular, exports `shop-orders-list`, `shop-order-detail` | 4201 | `orders` |
| 2 | `apps/microfrontends/insights` | React, exports `shop-order-stats`, `shop-activity-feed` | 4202 | `insights` |
| 2 | `apps/microfrontends/notes` | Vue, exports `shop-status-filter`, `shop-order-notes` | 4402 | `notes` |
| 2 | `apps/backoffices/backoffice-react` | React shell | 4200 | `backoffice-react` |
| 2 | `apps/backoffices/backoffice-vue` | Vue shell | 4400 | `backoffice-vue` |
| 2 | `apps/backoffices/backoffice-angular16` | Angular 16 shell (`node:18` image) | 4500 | `backoffice-angular16` |
| 3 | `packages/orders-elements` | `@shop/orders-elements`, built from `apps/microfrontends/orders` | none | built inside the `backoffice-vanilla` image |
| 3 | `apps/backoffices/backoffice-vanilla` | Plain JavaScript page that installs the package, strict CSP | 4600 | `backoffice-vanilla` |
| all | `tools/mock-api` | Orders REST API (Express, TypeScript run directly by Node) | 3000 | `mock-api` |

```bash
docker compose up --build --watch        # everything, edits sync into the containers
docker compose up --build --watch orders # one service and what it depends on
docker compose down                      # stop everything
docker compose up -d --force-recreate mock-api   # back to the seed data
```

Plain JavaScript projects (`examples/`) are served by `nginx:stable-alpine` with no
npm at runtime; Node projects start with `npm start` (or `npm run start:docker`) inside their
image. Dev servers must listen on `0.0.0.0` in Docker only.
Use Compose Watch (`develop.watch`), not bind mounts, so edits on Windows reach the container.

## Stages

Each stage is one branch and one pull request, and ends with something that runs in Docker:
every app arrives with its `Dockerfile.dev` and its `compose.yaml` service.

| # | Branch | Adds | Done when |
| --- | --- | --- | --- |
| 1 | `feature/foundation` | README, CLAUDE.md, architecture and demo docs, VS Code settings, `tools/mock-api`, `compose.yaml` | container is healthy; `/orders` returns 5, `?status=open` returns 3, PATCH works, recreating the container restores the seed |
| 2 | `feature/web-components-basics` | act 1: `examples/web-components-basics` | the page works; typed HTML shows as text |
| 3 | `feature/orders` | `apps/microfrontends/orders` (latest Angular) | dev page lists orders, row click fills the detail, "Mark as shipped" updates the list; `remoteEntry.json` exposes `./elements`; no `zone.js` |
| 4 | `feature/insights` | `apps/microfrontends/insights` | `/components` and `/web-components` work; `remoteEntry.js` exposes `./elements` and works from another origin |
| 5 | `feature/backoffice-react` | `apps/backoffices/backoffice-react` | dashboard, `/orders` master-detail, deep link, theme switch, error card |
| 6 | `feature/notes-and-backoffice-vue` | `apps/microfrontends/notes`, the notes API, the `microfrontends` / `backoffices` folders | Notes' `remoteEntry.js` exposes `./elements` and works from another origin |
| 6b | `feature/backoffice-vue` | `apps/backoffices/backoffice-vue` | Vue shell shows Angular + React + Vue on `/orders`; only the failed remote shows an error card |
| 7 | `feature/backoffice-angular16` | `apps/backoffices/backoffice-angular16` | demo acts 2.1, 2.2 and 2.4 pass; two `ng-version` values on one page |
| 8 | `feature/orders-package-and-vanilla` | act 3: `packages/orders-elements`, `apps/backoffices/backoffice-vanilla`, package option in `backoffice-react` | demo act 3 passes; only `localhost:4600` scripts; no CSP errors |
| 9 | `feature/run-scripts` | Windows `.bat` shortcuts in `scripts/` around `docker compose` | `start-all.bat`, `stop-all.bat` and `open-demo.bat` work |

## Known pitfalls

| Symptom | Fix |
| --- | --- |
| CORS error loading `remoteEntry.json` | Add `Access-Control-Allow-Origin: *` to the `serve` options of `apps/microfrontends/orders` |
| `Failed to resolve component: shop-...` in Vue | Set `isCustomElement` for `shop-` tags in the Vite Vue plugin |
| Vue custom element events have an array `detail` and do not bubble | Vue's `defineCustomElement` dispatches `detail: [...args]` without `bubbles`/`composed`. `defineVueElement` in `apps/microfrontends/notes` wraps the component and dispatches the contract `CustomEvent` from `useHost()` instead |
| oxlint reports React hook rules in a Vue project | Use the Vue plugins in `.oxlintrc.json` (`vue`, `typescript`, `oxc`), not the React config |
| React remote in another page: `@vitejs/plugin-react can't detect preamble` | Exclude the exposed folder from Fast Refresh: `react({ exclude: [/\/node_modules\//, /\/src\/insights\//] })` |
| Remote files load from the shell's port instead of the remote's | Set `server.origin` to the remote's own URL in `vite.config.ts` |
| A Vite shell downloads every `remoteEntry.js` on its first page | Module Federation's default `shareStrategy: 'version-first'` fetches all remotes up front; set `shareStrategy: 'loaded-first'` in the host |
| Retry never recovers a Module Federation remote after an outage | The browser caches a failed `import()` of `remoteEntry.js` until the page reloads; reload the page. Native Federation fetches `remoteEntry.json` first, so its Retry works |
| Two federation formats | Angular remotes: Native Federation (`remoteEntry.json`). React and Vue remotes: `@module-federation/vite` (`remoteEntry.js`). Shells load each with its own runtime |
| Do not set `ENV NODE_ENV=development` in a Vite `Dockerfile.dev` | The React guide does not; Vite sets the mode itself |
| Angular 16: "Module not found" for a URL import | Write `import(/* webpackIgnore: true */ url)`; this is the one allowed comment, webpack needs it |
| Angular 16: the orchestrator's remote imports break under webpack | Its default `loadModuleFn` only has `@vite-ignore`. Pass `loadModuleFn: (url) => import(/* webpackIgnore: true */ url)` to `initFederation`; the two "Critical dependency" build warnings that remain are about the unused default |
| Angular 16: `Cannot find module '@softarc/native-federation-orchestrator/options'` | The CLI 16 template uses `"moduleResolution": "node"`, which ignores `exports`. Use `"bundler"` and `"skipLibCheck": true` |
| Angular 16 shell: should it use `@angular-architects/native-federation`? | No. Its 16.x runtime cannot read Orders' v4 `remoteEntry.json`, and the shell shares nothing with Angular 22. The orchestrator plus `@module-federation/runtime` load all three remotes |
| Angular 16 CLI refuses to run | Its image must be `node:18`; run its `npm`/`ng` commands in that container, not on the host |
| Page does not load on `localhost:<port>` | The dev server listens on `127.0.0.1` inside the container. Bind `0.0.0.0` in Docker only (a `docker` configuration or a `start:docker` script), never in the local `npm start` |
| Edits do not reach the container | Start with `--watch`, and check the service's `develop.watch` paths |
| `docker compose watch` says "cannot take exclusive lock" | Another `watch` for this project is still running; stop it first |
| nginx container is "unhealthy" but the page loads | Alpine resolves `localhost` to `::1`: nginx needs `listen [::]:80;` as well as `listen 80;` |
| `esbuild` or `rollup` binary errors in a container | Host `node_modules` leaked in: keep `node_modules` in every `.dockerignore` |
| An event never arrives | Event names are case-sensitive, and the listener must be on the element itself |
| React 19: a custom element event never arrives | React keeps the name after `on` exactly as written: `onstatusPicked` listens to `statusPicked`; `onStatusPicked` would listen to `StatusPicked` |
| The activity feed does not update | Assign a new array to `entries`; never mutate it |
| `Unknown argument: host` from `ng serve` | The federation builder has no `host` option. Put `"host": "0.0.0.0"` in a `docker` configuration of the `serve-original` dev server, point the federation `serve` target's `docker` configuration at it, and run `npm run start:docker` in the image. Local `npm start` keeps `localhost` |
| Federation: `Could not resolve "@angular/animations/browser"` | `keepAll` shares every Angular entry point; add `@angular/platform-browser/animations` and `.../animations/async` to `skip` |
| `ng add` for federation adds `es-module-shims` and the orchestrator to `package.json` | Both are already dependencies of `@angular-architects/native-federation`; keep only that one. Use native import maps: `shimMode: false` in `initFederation` and `esmsInitOptions` |
| Native Federation `ng add` fails | On Angular 20 or 21 the package is `@angular-architects/native-federation-v4`; on 22+ it is `@angular-architects/native-federation` |
| `npm ci` fails with `EINTEGRITY` in `backoffice-vanilla` | The package was rebuilt without a new version: bump it in `packages/orders-elements/package.json`, repack, reinstall |
