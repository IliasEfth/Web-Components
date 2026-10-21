# Architecture

One online shop back office, told in two acts:

1. **Pure Web Components.** How to write a component with nothing but the browser.
2. **Micro-frontends calling each other.** Angular, React and Vue ship their features as custom
   elements, each from its own server, and React, Vue and Angular 16 hosts load them at runtime
   and use them all on one page. No app imports another app's code; they meet only through tags:
   attributes and properties go down, `CustomEvent`s come up.

## The cast

| Act | Folder | Role | Framework | Port | Ships |
| --- | --- | --- | --- | --- | --- |
| 1 | `examples/web-components-basics` | Three native components | none | 4100 | static files |
| 2 | `apps/microfrontends/orders` | Remote: order list and order detail | current Angular, zoneless | 4201 | `remoteEntry.json` (Native Federation) |
| 2 | `apps/microfrontends/insights` | Remote: order statistics and activity feed | React 19 | 4202 | `remoteEntry.js` (Module Federation) |
| 2 | `apps/microfrontends/notes` | Remote: status filter and order notes | Vue 3.5 | 4402 | `remoteEntry.js` (Module Federation) |
| 2 | `apps/backoffices/backoffice-react` | Host | React 19 + React Router | 4200 | the site |
| 2 | `apps/backoffices/backoffice-vue` | Host | Vue 3.5 + Vue Router | 4400 | the site |
| 2 | `apps/backoffices/backoffice-angular16` | Host, on an old Angular on purpose | Angular 16, Zone.js | 4500 | the site |
| all | `tools/mock-api` | Orders REST API | Express, TypeScript | 3000 | `GET/PATCH /orders`, `GET/POST /orders/:id/notes` |

```text
Act 1   examples/web-components-basics          user-card · counter-button · todo-list

Act 2   remotes                                   hosts
        apps/microfrontends/orders     Angular  :4201  ──┐
          shop-orders-list                 ├──── federation runtime ───►  backoffice-react      :4200
          shop-order-detail                │                                backoffice-vue        :4400
        apps/microfrontends/insights   React    :4202  ──┤                                backoffice-angular16  :4500
          shop-order-stats                 │
          shop-activity-feed               │
        apps/microfrontends/notes      Vue      :4402  ──┘
          shop-status-filter
          shop-order-notes

All     tools/mock-api :3000   GET/PATCH /orders · GET/POST /orders/:id/notes
```

## Rules every app follows

| Concern | Rule | Why |
| --- | --- | --- |
| Configuration | Passed once to `defineElements({ apiBase, getAuthToken })`, never as attributes | The same as dependency injection inside a framework app; tokens never appear in the DOM |
| Host to element | Strings and numbers as kebab-case attributes; objects and arrays as properties | Attributes show in DevTools and work from plain HTML |
| Element to host | `CustomEvent` with `bubbles: true, composed: true` and an object `detail` | Crosses Shadow DOM and works in every framework |
| Element to element | Always through the host | Each element stays usable and understandable on its own |
| Loading a remote | Each remote exports one idempotent `defineElements(config): Promise<void>` | Safe to call from every page and every host; the first call's configuration wins |
| Routing | The host owns the URL and passes state down as inputs | Deep links (`/orders/A-1003`) set `order-id` |
| Styling | Each component styles itself inside its Shadow DOM and reads the host's `--shop-*` custom properties | Custom properties cross the shadow boundary; nothing else leaks, so the host decides the colours |
| Rendering data | `textContent` only: never `innerHTML`, `dangerouslySetInnerHTML`, `v-html` or `[innerHTML]` | Customer data cannot run code |
| Failure | Each remote is loaded behind its own error card with a Retry button | One team's outage never blanks the page |
| Projects | Every folder is an independent npm project; no workspaces, no shared `node_modules` | Each team builds and deploys on its own |

## Contracts

These names are shared between apps. Renaming one breaks another app silently.

| Tag | Owner | Inputs (attribute / property) | Events (`detail`) |
| --- | --- | --- | --- |
| `shop-orders-list` | `apps/microfrontends/orders` | `status`, `page-size` | `orderSelected` `{ id }` |
| `shop-order-detail` | `apps/microfrontends/orders` | `order-id` | `orderUpdated` `{ id, status }`, `closed` `{ id }` |
| `shop-order-stats` | `apps/microfrontends/insights` | `refresh-key` | `statusPicked` `{ status }` |
| `shop-activity-feed` | `apps/microfrontends/insights` | property `entries` (assign a new array to update) | `cleared` |
| `shop-status-filter` | `apps/microfrontends/notes` | `value` | `statusChange` `{ status }` |
| `shop-order-notes` | `apps/microfrontends/notes` | `order-id` | `noteAdded` `{ orderId, text }` |

`status` is one of `all`, `open`, `shipped`. Event names are case-sensitive: `orderSelected`,
never `orderselected`.

Every remote that calls the API is configured once, before its tags are used:

```ts
interface IRemoteConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}

await defineElements({ apiBase: 'http://localhost:3000' });
```

`getAuthToken` is a function, so a host can hand over a token that changes after login without
redefining anything.

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
| `backoffice-react` | blue `#2563eb` (switchable in Settings) |
| `backoffice-vue` | green `#16a34a` |
| `backoffice-angular16` | red `#dc2626` |

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
`docker compose up -d --force-recreate mock-api` restores the seed after a demo. CORS is open
(`Content-Type` and `Authorization` headers allowed), so every app can call it from its own port.

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
