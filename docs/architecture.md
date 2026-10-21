# Architecture

One online shop back office, told in three acts:

1. **Pure Web Components.** How to write a component with nothing but the browser.
2. **Frameworks calling each other.** Angular, React and Vue ship their features as custom
   elements, and React, Vue and Angular 16 hosts use them all on one page. No app imports
   another app's code; they meet only through tags: attributes and properties go down,
   `CustomEvent`s come up.
3. **A package instead of a server.** The Angular components are exported as an npm package and
   installed into a page with no framework at all, so nothing is loaded from the Orders server.

## The cast

| Act | Folder | Role | Framework | Port | Ships |
| --- | --- | --- | --- | --- | --- |
| 1 | `examples/web-components-basics` | Three native components | none | 4100 | static files |
| 2 | `apps/orders` | Remote: order list and order detail | current Angular, zoneless | 4201 | `remoteEntry.json` (Native Federation) |
| 2 | `apps/insights` | Remote: order statistics and activity feed | React 19 | 4202 | `insights-elements.js` |
| 2 | `apps/notes` | Remote: status filter and order notes | Vue 3.5 | 4402 | `notes-elements.js` |
| 2 | `apps/backoffice-react` | Host | React 19 + React Router | 4200 | the site |
| 2 | `apps/backoffice-vue` | Host | Vue 3.5 + Vue Router | 4400 | the site |
| 2 | `apps/backoffice-angular16` | Host, on an old Angular on purpose | Angular 16, Zone.js | 4500 | the site |
| 3 | `packages/orders-elements` | `@shop/orders-elements`: the Orders components as an npm package | Angular, bundled | none | `orders-elements.js` |
| 3 | `apps/backoffice-vanilla` | Host that installs the package, with a strict CSP | none | 4600 | the site |
| all | `tools/mock-api` | Orders REST API | Express, TypeScript | 3000 | `GET/PATCH /orders` |

```text
Act 1   examples/web-components-basics          user-card · counter-button · todo-list

Act 2   remotes                                   hosts
        apps/orders     Angular  :4201  ──┐
          shop-orders-list                 ├──── import() at runtime ───►  backoffice-react      :4200
          shop-order-detail                │                                backoffice-vue        :4400
        apps/insights   React    :4202  ──┤                                backoffice-angular16  :4500
          shop-order-stats                 │
          shop-activity-feed               │
        apps/notes      Vue      :4402  ──┘
          shop-status-filter
          shop-order-notes

Act 3   apps/orders ── npm pack ──► @shop/orders-elements ── npm install ──► backoffice-vanilla :4600

All     tools/mock-api :3000   GET/PATCH /orders
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
| `shop-orders-list` | `apps/orders` | `status`, `page-size` | `orderSelected` `{ id }` |
| `shop-order-detail` | `apps/orders` | `order-id` | `orderUpdated` `{ id, status }`, `closed` `{ id }` |
| `shop-order-stats` | `apps/insights` | `refresh-key` | `statusPicked` `{ status }` |
| `shop-activity-feed` | `apps/insights` | property `entries` (assign a new array to update) | `cleared` |
| `shop-status-filter` | `apps/notes` | `value` | `statusChange` `{ status }` |
| `shop-order-notes` | `apps/notes` | `order-id` | `noteAdded` `{ orderId, text }` |

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

## Act 2 or act 3: two ways to ship a remote

| | Runtime remote (`import(url)`) | Installed package |
| --- | --- | --- |
| Used by | `backoffice-react`, `backoffice-vue`, `backoffice-angular16` | `backoffice-vanilla` |
| A new release reaches users | at the next page load, with no host rebuild | after the host updates the package |
| Code that runs | whatever the remote server sends | exactly what was installed, pinned by hash in `package-lock.json` |
| If the remote server is down | that remote shows an error card | nothing changes |
| Content Security Policy | must allow the remote's origin | `script-src 'self'` |

Runtime remotes give teams independent deployments. An installed package gives the host
control: nothing runs that it did not install and review.
