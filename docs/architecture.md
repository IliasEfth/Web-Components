# Architecture

One online shop, one back office, five ways to build a page of it. Every page shows the same
orders, statistics and notes; only the host framework changes. The pieces never import each
other's code. They meet only through **custom elements**: attributes and properties go down,
`CustomEvent`s come up.

## The cast

| Folder | Role | Framework | Port | Ships |
| --- | --- | --- | --- | --- |
| `examples/web-components-basics` | Warm-up: the native API in three small components | none | 4100 | static files |
| `packages/ui` | `@shop/ui`, the design system every app renders with | none | 4300 | `ui.js` (ES module) |
| `tools/mock-api` | Orders REST API | Express, TypeScript | 3000 | `GET/PATCH /orders` |
| `apps/orders` | Remote: order list and order detail | current Angular, zoneless | 4201 | `remoteEntry.json` (Native Federation) |
| `apps/insights` | Remote: order statistics and activity feed | React 19 | 4202 | `insights-elements.js` |
| `apps/notes` | Remote: status filter and order notes | Vue 3.5 | 4402 | `notes-elements.js` |
| `packages/orders-elements` | `@shop/orders-elements`: the Orders remote as an npm package | Angular, bundled | none | `orders-elements.js` |
| `apps/backoffice-react` | Host | React 19 + React Router | 4200 | the site |
| `apps/backoffice-vue` | Host | Vue 3.5 + Vue Router | 4400 | the site |
| `apps/backoffice-angular16` | Host, on an old Angular on purpose | Angular 16, Zone.js | 4500 | the site |
| `apps/backoffice-vanilla` | Host with a strict Content Security Policy | none | 4600 | the site |

```text
                          tools/mock-api :3000
                                  ▲
                 fetch /orders    │
   ┌──────────────────────────────┼───────────────────────────────┐
   │ remotes                      │                               │
   │  apps/orders  :4201      apps/insights  :4202      apps/notes  :4402
   │  Angular                 React                     Vue
   │  shop-orders-list        shop-order-stats          shop-status-filter
   │  shop-order-detail       shop-activity-feed        shop-order-notes
   └───────▲──────────────────────────▲───────────────────────▲─────┘
           │ import() at runtime       │                       │
   ┌───────┴──────────────────────────┴───────────────────────┴─────┐
   │ hosts   backoffice-react :4200   backoffice-vue :4400           │
   │         backoffice-angular16 :4500                             │
   │         backoffice-vanilla :4600 ◄── npm install @shop/orders-elements
   └────────────────────────────────▲───────────────────────────────┘
                                    │ every app renders with
                             packages/ui  :4300   ui-button ui-card ui-badge ui-data-table
```

## Rules every app follows

| Concern | Rule | Why |
| --- | --- | --- |
| Host to element | Strings and numbers as kebab-case attributes; objects, arrays and secrets as properties | Attributes show in DevTools; tokens must not |
| Element to host | `CustomEvent` with `bubbles: true, composed: true` and an object `detail` | Crosses Shadow DOM and works in every framework |
| Element to element | Always through the host | Each element stays usable and understandable on its own |
| Loading a remote | Each remote exports one idempotent `defineElements(): Promise<void>` | Safe to call from every page and every host |
| Routing | The host owns the URL and passes state down as inputs | Deep links (`/orders/A-1003`) set `order-id` |
| Styling | Shadow DOM inside, `--shop-*` custom properties set by the host on `:root` | Custom properties cross the shadow boundary; nothing else leaks |
| Design system | `@shop/ui` is loaded once by the host; remotes treat `ui-*` as external tags | One copy, one registration |
| Rendering data | `textContent` only: never `innerHTML`, `dangerouslySetInnerHTML`, `v-html` or `[innerHTML]` | Customer data cannot run code |
| Failure | Each remote is loaded behind its own error card with a Retry button | One team's outage never blanks the page |
| Projects | Every folder is an independent npm project; no workspaces, no shared `node_modules` | Each team builds and deploys on its own |

## Contracts

These names are shared between apps. Renaming one breaks another app silently.

| Tag | Owner | Inputs (attribute / property) | Events (`detail`) |
| --- | --- | --- | --- |
| `ui-button` | `@shop/ui` | `variant`, `disabled` | `pressed` (click count) |
| `ui-card` | `@shop/ui` | `heading`, `elevated` | none |
| `ui-badge` | `@shop/ui` | `tone` | none |
| `ui-data-table` | `@shop/ui` | properties `columns`, `rows`; attribute `page-size` | `rowClick` (row object) |
| `shop-orders-list` | `apps/orders` | `status`, `page-size`, `api-base`; property `authToken` | `orderSelected` `{ id }` |
| `shop-order-detail` | `apps/orders` | `order-id`, `api-base`; property `authToken` | `orderUpdated` `{ id, status }`, `closed` |
| `shop-order-stats` | `apps/insights` | `api-base`, `refresh-key` | `statusPicked` `{ status }` |
| `shop-activity-feed` | `apps/insights` | property `entries` (assign a new array to update) | `cleared` |
| `shop-status-filter` | `apps/notes` | `value` | `statusChange` `{ status }` |
| `shop-order-notes` | `apps/notes` | `order-id` | `noteAdded` `{ orderId, text }` |

`status` is one of `all`, `open`, `shipped`. Event names are case-sensitive: `orderSelected`,
never `orderselected`.

### Theme tokens

Each host sets these on `:root`; every component reads them.

| Token | Meaning |
| --- | --- |
| `--shop-color-primary` | Brand colour of the host |
| `--shop-color-on-primary` | Text on the brand colour |
| `--shop-radius` | Corner radius |
| `--shop-surface` | Card background |
| `--shop-border` | Borders and dividers |

| Host | Primary colour |
| --- | --- |
| `apps/orders` dev harness | teal `#0d9488` |
| `backoffice-react` | blue `#2563eb` (switchable in Settings) |
| `backoffice-vue` | green `#16a34a` |
| `backoffice-angular16` | red `#dc2626` |
| `backoffice-vanilla` | purple `#7c3aed` |

## The data

`tools/mock-api` serves five orders from `db.seed.json`:

| Request | Result |
| --- | --- |
| `GET /orders` | all 5 orders |
| `GET /orders?status=open` | the 3 open orders (`all`, `open` or `shipped`; anything else is a 400) |
| `GET /orders/A-1001` | one order, or a 404 |
| `PATCH /orders/A-1001` `{ "status": "shipped" }` | the updated order (only `status` can change) |

```json
{ "id": "A-1001", "customer": "Nikos Papadopoulos", "total": 129.9, "status": "open", "createdAt": "2026-10-12" }
```

The server is about 100 lines of Express in `tools/mock-api/src`, run by Node's built-in
TypeScript support with no build step. On start it copies `db.seed.json` to `db.json` if that
file is missing, and saves every change there. The file lives inside the container, so
`docker compose up -d --force-recreate mock-api` restores the seed after a demo. CORS is open
(`Content-Type` and `Authorization` headers allowed), so every app can call it from its own port.

## Two ways to ship a remote

| | Runtime remote (`import(url)`) | Installed package |
| --- | --- | --- |
| Used by | `backoffice-react`, `backoffice-vue`, `backoffice-angular16` | `backoffice-vanilla` |
| A new release reaches users | at the next page load, with no host rebuild | after the host updates the package |
| Code that runs | whatever the remote server sends | exactly what was installed, pinned by hash in `package-lock.json` |
| If the remote server is down | that remote shows an error card | nothing changes |
| Content Security Policy | must allow the remote's origin | `script-src 'self'` |

Runtime remotes give teams independent deployments. An installed package gives the host
control: nothing runs that it did not install and review.
