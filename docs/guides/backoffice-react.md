# Act 2: the React back office, hosting other apps' components

`apps/backoffice-react` is the first shell: a React app (`npm create vite@latest`, React +
TypeScript template) that puts the Angular components from `apps/orders` and the React
components from `apps/insights` on one page. It imports neither app. Both are loaded at
runtime, the first time `/orders` opens.

| Route | What it shows |
| --- | --- |
| `http://localhost:4200/dashboard` | Plain React with no remote: counts, revenue, and links to the open orders |
| `http://localhost:4200/orders` | The Angular list and detail and the React statistics and feed, wired together by the shell |
| `http://localhost:4200/orders/A-1003` | The same page opened with an order (a deep link) |
| `http://localhost:4200/settings` | The theme switch |

## The project

```text
src/
  remote-entries.ts          where each remote lives (also read by vite.config.ts)
  app-config.ts              the configuration every remote receives: { apiBase }
  remotes/
    orders-remote.ts         loadOrdersElements(): Native Federation
    insights-remote.ts       loadInsightsElements(): Module Federation
    RemoteGate.tsx           loading text, then the elements or an error card with Retry
    remote-modules.d.ts      the type of 'insights/elements'
  web-components/
    custom-elements.d.ts     JSX typings for the four shop- tags
  models/                    the contract shapes: IOrder, event details, IRemoteConfig
  clients/orders-client.ts   the dashboard's own fetch
  components/StatusFilter.tsx
  pages/                     DashboardPage, OrdersPage, SettingsPage, ErrorPage
  theme/themes.ts
  shared/useActivityLog.ts
  App.tsx  router.tsx  main.tsx  styles.css
```

Three packages are added to the template:

| Package | Why |
| --- | --- |
| `react-router` | The shell owns the URL. The order id in `/orders/:orderId` becomes the detail's `order-id` |
| `@softarc/native-federation-orchestrator` | The Native Federation runtime for any page; loads Orders' `remoteEntry.json` |
| `@module-federation/vite` (dev) | The plugin Insights already uses, here as a host: loads `remoteEntry.js` and shares the shell's React |

## Two remotes, two runtimes, one contract

Orders is built with Native Federation and Insights with Module Federation, so each has its own
loader. Behind both is the same call: `defineElements(config)`.

```ts
export function loadOrdersElements(): Promise<void> {
  ordersReady ??= initFederation({ orders: remoteEntries.orders })
    .then(({ loadRemoteModule }) => loadRemoteModule<IRemoteElements>('orders', './elements'))
    .then(({ defineElements }) => defineElements(remoteConfig))
    .catch((error: unknown) => {
      ordersReady = undefined;
      throw error;
    });
  return ordersReady;
}
```

```ts
export function loadInsightsElements(): Promise<void> {
  insightsReady ??= import('insights/elements')
    .then(({ defineElements }) => defineElements(remoteConfig))
    .catch(/* the same reset */);
  return insightsReady;
}
```

- **Native Federation.** The orchestrator reads `remoteEntry.json`, writes a native import map
  for Angular's shared packages, and imports `./elements`. The shell is not built with federation
  and shares nothing with Angular, so it needs only this runtime: no `es-module-shims`.
- **Module Federation.** `vite.config.ts` lists Insights as a remote of the same plugin:

  ```ts
  federation({
    name: 'backoffice',
    remotes: {
      insights: { type: 'module', name: 'insights', entry: remoteEntries.insights },
    },
    shared: ['react', 'react-dom'],
    shareStrategy: 'loaded-first',
    dts: false,
  }),
  ```

  `shared` gives Insights the shell's React, so one React runs on the page.
  `shareStrategy: 'loaded-first'` keeps the remote lazy. The default (`version-first`) would
  download every `remoteEntry.js` on the first page to compare versions.
- **Retrying.** A failed load resets the cached promise, so Retry starts again. For Orders that
  is enough: the orchestrator fetches `remoteEntry.json` before it imports anything. For Insights,
  the browser caches a failed `import()` of `remoteEntry.js` until the page reloads, so after an
  Insights outage reload the page instead of pressing Retry.

## The page wires everything

React 19 binds custom elements like an Angular template: properties and attributes go in, and
`on` plus the exact event name adds a listener.

```tsx
<RemoteGate name="Orders" load={loadOrdersElements}>
  <shop-orders-list
    status={status}
    page-size="10"
    onorderSelected={(event) => navigate(`/orders/${event.detail.id}`)}
  />
  <shop-order-detail
    order-id={orderId}
    onorderUpdated={() => setRefreshCount((count) => count + 1)}
    onclosed={() => navigate('/orders')}
  />
</RemoteGate>

<RemoteGate name="Insights" load={loadInsightsElements}>
  <shop-order-stats
    refresh-key={String(refreshCount)}
    onstatusPicked={(event) => setStatus(event.detail.status)}
  />
  <shop-activity-feed entries={entries} oncleared={clear} />
</RemoteGate>
```

| Who | Does what | How the others learn |
| --- | --- | --- |
| React filter | picks a status | `status` on the Angular list |
| React stat tile (Insights) | `statusPicked` | the filter and the Angular list follow |
| Angular list | `orderSelected` | the URL changes; `order-id` follows the URL |
| Angular detail | `orderUpdated` | `refresh-key` changes; the React counts reload |
| Angular detail | `closed` | back to `/orders` |

Every event also goes into the activity feed. Browser back and forward move between orders,
because the selected order lives only in the URL.

## Failure stays local

Each remote sits in its own `RemoteGate`. If its server is down, only that card turns into
"Orders is unavailable" with a Retry button. The other remote, the dashboard and the navigation
keep working. The dashboard has a route `errorElement` for when the API itself is down.

## Theme

`App` keeps the theme in state and writes `--shop-color-primary` on `:root`. Settings changes it
through the router's outlet context. Custom properties cross shadow roots, so the Angular list
and the React tiles recolour with the shell.

## Run it

`Dockerfile.dev` follows Docker's React guide, like Insights. The service waits for the API and
both remotes to be healthy.

```bash
docker compose up --build --watch backoffice-react    # http://localhost:4200
```

## Done when

- `/dashboard` shows the counts and the open orders, with no request to 4201 or 4202.
- An order link opens `/orders/<id>` with that order in the Angular detail.
- The React filter and the React stat tiles change the Angular list; a row click changes the URL.
- "Mark as shipped" logs `orderUpdated` and the React counts change.
- Back and forward restore the selected order.
- In Settings, Orange recolours the Angular list.
- `docker compose stop orders` (or `insights`): only that card shows the error;
  `docker compose start orders` and Retry recover it (Insights recovers on a page reload).
- `npm run build` and `npm run lint` pass.
