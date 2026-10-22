# Architecture

One online shop back office, told in two acts:

1. **Pure Web Components.** How to write a component with nothing but the browser.
2. **Micro-frontends calling each other.** Angular, React and Vue ship their features as custom
   elements, each from its own server, and React, Vue and Angular 16 hosts load them at runtime
   and use them all on one page. No app imports another app's code; they meet only through tags:
   attributes and properties go down, `CustomEvent`s come up.

## The cast

| Act | Folder | Role | Framework | Path | Ships |
| --- | --- | --- | --- | --- | --- |
| 1 | `examples/web-components-basics` | Three native components | none | `/` | static files |
| 2 | `apps/microfrontends/orders` | Remote: order list and order detail | current Angular, zoneless | `/orders/` | `remoteEntry.json` (Native Federation) |
| 2 | `apps/microfrontends/insights` | Remote: order statistics and activity feed | React 18 | `/insights/` | `remoteEntry.js` (Module Federation) |
| 2 | `apps/microfrontends/notes` | Remote: order notes | Vue 3.5 | `/notes/` | `remoteEntry.js` (Module Federation) |
| 2 | `apps/backoffices/backoffice-react` | Host | React 19 + React Router | `/react/` | the site |
| 2 | `apps/backoffices/backoffice-vue` | Host, on an older Vue | Vue 3.4 + Vue Router | `/vue/` | the site |
| 2 | `apps/backoffices/backoffice-angular16` | Host, on an old Angular on purpose | Angular 16, Zone.js | `/angular16/` | the site |
| all | `tools/mock-api` | Orders REST API | Express, TypeScript | `/api/` | `GET/PATCH /orders`, `GET/POST /orders/:id/notes` |

```text
Browser ──► http://localhost:8080 ──► gateway (nginx) ──► shop-network, by service name

Act 1   /             web-components-basics       user-card · counter-button · todo-list

Act 2   remotes                                       hosts
        /orders/     orders     Angular  ──┐
          shop-orders-list                 ├──── federation runtime ───►  /react/      backoffice-react
          shop-order-detail                │                                /vue/        backoffice-vue
        /insights/   insights   React    ──┤                                /angular16/  backoffice-angular16
          shop-order-stats                 │
          shop-activity-feed               │
        /notes/      notes      Vue      ──┘
          shop-order-notes

All     /api/        mock-api   GET/PATCH /orders · GET/POST /orders/:id/notes
```

## One origin, one way in

Every service runs on `shop-network`, an `internal` Docker network: nothing outside Docker can
reach it, and the services themselves cannot reach the internet. The gateway, an nginx
container in `tools/gateway`, is the only container also on a normal network (`shop-edge`) and
the only published port. It sends each
path to its service by Docker DNS name (`/orders/` to `http://orders:4201`, `/api/` to
`http://mock-api:3000`, and so on). Each app serves itself under its own path, so the browser
sees one origin, `http://localhost:8080`. Hosts load remotes and elements call the API with
relative URLs (`/orders/remoteEntry.json`, `/api/orders`): no hard-coded hosts, no CORS.

nginx looks a service up when a request arrives, not when it starts, so the gateway stays up
while one service is stopped; only that path fails.

### Who may call the API

The gateway only lets the front ends call `/api/`. Browsers add `Sec-Fetch-Site` and
`Sec-Fetch-Mode` to every request, and a page cannot change them:

| Caller | `Sec-Fetch-Site` : `Sec-Fetch-Mode` | Gateway answers |
| --- | --- | --- |
| A shell or element on `localhost:8080` calling `fetch('/api/orders')` | `same-origin:cors` | the API's response |
| The API URL typed in the address bar | `none:navigate` | `403` |
| A page on another site | `cross-site:cors` | `403` |
| curl, Postman, scripts | not sent | `403` |

Only `GET`, `POST` and `PATCH` get through, the methods the API uses. The API itself sends no
CORS headers, so no other origin can read its responses either. The headers say which page a
browser request comes from; they do not prove who the user is. That takes authentication, which
this demo leaves out.

## Rules every app follows

| Concern | Rule | Why |
| --- | --- | --- |
| Configuration | Each remote knows its own API endpoint; the host passes none | Elements are standalone: a host only loads them and places them |
| Host to element | Strings and numbers as kebab-case attributes; objects and arrays as properties | Attributes show in DevTools and work from plain HTML |
| Element to host | `CustomEvent` with `bubbles: true, composed: true` and an object `detail` | Crosses Shadow DOM and works in every framework |
| Element to element | Always through the host | Each element stays usable and understandable on its own |
| Loading a remote | Each remote exports one idempotent `defineElements(): Promise<void>` | Safe to call from every page and every host |
| Routing | The host owns the URL and passes state down as inputs | Deep links (`/orders/A-1003`) set `order-id` |
| Styling | Each component styles itself inside its Shadow DOM and reads the host's `--shop-*` custom properties | Custom properties cross the shadow boundary; nothing else leaks, so the host decides the colours |
| Rendering data | `textContent` only: never `innerHTML`, `dangerouslySetInnerHTML`, `v-html` or `[innerHTML]` | Customer data cannot run code |
| Failure | Each remote is loaded behind its own error card with a Retry button | One team's outage never blanks the page |
| Projects | Every folder is an independent npm project; no workspaces, no shared `node_modules` | Each team builds and deploys on its own |

## Contracts

Every team publishes its contract as a small, types-only npm package in its own folder. Other
apps install it from that folder (`npm install <folder>`, saved as a `file:` link), so nothing
goes through a registry. The owner implements its own contract, and a change that breaks it
stops the build of the owner and of every app that uses it.

| Package | Owner | What it describes |
| --- | --- | --- |
| `@shop/api-contract` | `tools/mock-api/contract` | the models, the parameters and `IOrdersApi`: one documented method per HTTP operation |
| `@shop/orders-contract` | `apps/microfrontends/orders/contract` | `shop-orders-list`, `shop-order-detail` and `defineElements` |
| `@shop/insights-contract` | `apps/microfrontends/insights/contract` | `shop-order-stats`, `shop-activity-feed` and `defineElements` |
| `@shop/notes-contract` | `apps/microfrontends/notes/contract` | `shop-order-notes` and `defineElements` |

Each element contract has the same shape, so a host can turn any of them into typings for its
own framework with one generic type:

```ts
export interface IOrdersListContract {
  tagName: 'shop-orders-list';
  attributes: { status: OrderStatusFilter; 'page-size': string };
  properties: { status: OrderStatusFilter; pageSize: number };
  events: { orderSelected: IOrderSelectedDetail };
}
```

Only the micro-frontends call the API, each with the endpoint it knows; the shells never do and
pass no configuration. Every micro-frontend writes its own HTTP client for the operations it calls, and
declares which ones:

```ts
export class OrdersClient implements Pick<IOrdersApi, 'listOrders'> {
  listOrders(params: IListOrdersParams = {}): Promise<IOrder[]> { … }
}
```

The contracts are `devDependencies`: they are types, needed to type-check and build, never at
runtime.

The names below are shared between apps. Renaming one breaks another app, which is exactly what
the contract packages catch at build time.

| Tag | Owner | Inputs (attribute / property) | Events (`detail`) |
| --- | --- | --- | --- |
| `shop-orders-list` | `apps/microfrontends/orders` | `status`, `page-size` | `orderSelected` `{ id }` |
| `shop-order-detail` | `apps/microfrontends/orders` | `order-id` | `orderUpdated` `{ id, status }`, `closed` `{ id }` |
| `shop-order-stats` | `apps/microfrontends/insights` | `refresh-key` | `statusPicked` `{ status }` |
| `shop-activity-feed` | `apps/microfrontends/insights` | property `entries` (assign a new array to update) | `cleared` |
| `shop-order-notes` | `apps/microfrontends/notes` | `order-id` | `noteAdded` `{ orderId, text }` |

`status` is one of `all`, `open`, `shipped`. Event names are case-sensitive: `orderSelected`,
never `orderselected`.

A host defines a remote's tags once, before it uses them, with no arguments:

```ts
await defineElements();
```

Each remote reads its API address from its own configuration, the same one its own pages use.

### Theme tokens

Each host sets these on `:root`; every component reads them, with a fallback of its own.

| Token | Meaning |
| --- | --- |
| `--shop-color-primary` | Brand colour of the host |
| `--shop-color-on-primary` | Text on the brand colour |
| `--shop-radius` | Corner radius |
| `--shop-surface` | Card background |
| `--shop-border` | Borders and dividers |

| Host | Primary colour |
| --- | --- |
| each remote's own dev page | teal `#0d9488` |
| `backoffice-react` | blue `#2563eb` |
| `backoffice-vue` | green `#16a34a` |
| `backoffice-angular16` | red `#dc2626` |

Every back office has a Settings page that switches between its own colour, Dark and Orange.

## The data

`tools/mock-api` serves five orders and their notes from `db.seed.json`:

| Request | Result |
| --- | --- |
| `GET /orders` | all 5 orders |
| `GET /orders?status=open` | the 3 open orders (`all`, `open` or `shipped`; anything else is a 400) |
| `GET /orders/A-1001` | one order, or a 404 |
| `PATCH /orders/A-1001` `{ "status": "shipped" }` | the updated order (only `status` can change) |
| `GET /orders/A-1001/notes` | the notes of one order, or a 404 |
| `POST /orders/A-1001/notes` `{ "text": "Call first" }` | the new note, `201` (1 to 500 characters, or a 400) |

```json
{ "id": "A-1001", "customer": "Nikos Papadopoulos", "total": 129.9, "status": "open", "createdAt": "2026-10-12" }
{ "id": 1, "orderId": "A-1001", "text": "Customer asked for gift wrapping.", "createdAt": "2026-10-12T09:30:00.000Z" }
```

The server is about 150 lines of Express in `tools/mock-api/src`, run by Node's built-in
TypeScript support with no build step. On start it copies `db.seed.json` to `db.json` if that
file is missing, and saves every change there. The file lives inside the container, so
`docker compose up -d --force-recreate mock-api` restores the seed after a demo. Apps reach it
through the gateway at `/api`.

## Remotes are live services

Every remote runs on its own server and every shell loads it at runtime:

| Remote | Format | Loaded by the shells with |
| --- | --- | --- |
| `orders` | Native Federation, `remoteEntry.json` | `@softarc/native-federation-orchestrator` |
| `insights`, `notes` | Module Federation, `remoteEntry.js` | `@module-federation/vite` (Vite shells), `@module-federation/runtime` (Angular 16) |

What that gives the teams:

| | |
| --- | --- |
| A new release reaches users | at the next page load, in every shell, with no shell rebuild |
| A remote's server is down | only that remote shows an error card; the rest of the page keeps working |
| Each team | builds, deploys and upgrades its framework on its own schedule |
