# Act 2: the React back office, hosting all three frameworks

`apps/backoffices/backoffice-react` is a React shell (`npm create vite@latest`, React + TypeScript
template) that puts the Angular components from Orders, the React components from Insights and
the Vue components from Notes on one page. It imports none of them. All three are loaded at
runtime, the first time `/orders` opens. Its colour is blue (`#2563eb`).

The shell runs **React 19**, the newest React, while the Insights components it hosts run on
React 18: the header shows the shell's version, and each Insights element carries
`data-react-version="18.3.1"`.

| Route | What it shows |
| --- | --- |
| `http://localhost:4200/dashboard` | Plain React with no remote: counts, revenue, and links to the open orders |
| `http://localhost:4200/orders` | The shell's filter and the five elements, wired together by the shell |
| `http://localhost:4200/orders/A-1003` | The same page opened with an order (a deep link) |
| `http://localhost:4200/settings` | The theme switch |

The Vue and Angular 16 shells have the same pages and the same layout; only the framework of the
shell changes.

## The project

```text
src/
  remote-entries.ts          where each remote lives (also read by vite.config.ts)
  app-config.ts              the configuration every remote receives: { apiBase }
  remotes/
    orders-remote.ts         Native Federation
    insights-remote.ts       Module Federation
    notes-remote.ts          Module Federation
    RemoteGate.tsx           loading text, then the elements or an error card with Retry
    remote-modules.d.ts      the types of 'insights/elements' and 'notes/elements'
  web-components/
    custom-elements.d.ts     JSX typings for the five shop- tags, built from the three contracts
  clients/orders-client.ts   implements listOrders from @shop/api-contract, for the dashboard
  components/StatusFilter.tsx the shell's own All / Open / Shipped filter
  pages/                     DashboardPage, OrdersPage, SettingsPage, ErrorPage
  theme/themes.ts
  shared/useActivityLog.ts
  App.tsx  router.tsx  main.tsx  styles.css
```

Three packages are added to the template:

| Package | Why |
| --- | --- |
| `react-router` | The shell owns the URL. The order id in `/orders/:orderId` becomes `order-id` |
| `@softarc/native-federation-orchestrator` | The Native Federation runtime for any page; loads Orders' `remoteEntry.json` |
| `@module-federation/vite` (dev) | Loads Insights' and Notes' `remoteEntry.js` and offers the shell's React to them |

And the four contracts, as dev dependencies installed from their teams' folders:
`@shop/api-contract`, `@shop/orders-contract`, `@shop/insights-contract` and
`@shop/notes-contract`. The shell has no copy of any shared type: the models, the event details,
`IRemoteConfig` and the type of each remote's `defineElements` all come from them.

```ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements
      extends ContractElements<OrdersContracts | InsightsContracts | NotesContracts> {}
  }
}
```

`ContractElements` turns every contract into the JSX props of its tag: attributes, properties,
and an `on<event>` prop typed with the event's `detail`. A tag, attribute or event that a team
renames stops compiling here.

## Three remotes, two runtimes, one contract

Orders is built with Native Federation, Insights and Notes with Module Federation, so there are
two loaders. Behind each is the same call: `defineElements(config)`.

```ts
export function loadOrdersElements(): Promise<void> {
  ordersReady ??= initFederation({ orders: remoteEntries.orders })
    .then(({ loadRemoteModule }) => loadRemoteModule<IOrdersRemote>('orders', './elements'))
    .then(({ defineElements }) => defineElements(remoteConfig))
    .catch((error: unknown) => {
      ordersReady = undefined;
      throw error;
    });
  return ordersReady;
}
```

```ts
export function loadNotesElements(): Promise<void> {
  notesReady ??= import('notes/elements')
    .then(({ defineElements }) => defineElements(remoteConfig))
    .catch(/* the same reset */);
  return notesReady;
}
```

- **Native Federation.** The orchestrator reads `remoteEntry.json`, writes a native import map
  for Angular's shared packages, and imports `./elements`. The shell is not built with federation
  and shares nothing with Angular, so it needs only this runtime.
- **Module Federation.** `vite.config.ts` lists Insights and Notes as remotes of the same plugin:

  ```ts
  federation({
    name: 'backoffice',
    remotes: {
      insights: { type: 'module', name: 'insights', entry: remoteEntries.insights },
      notes: { type: 'module', name: 'notes', entry: remoteEntries.notes },
    },
    shared: ['react', 'react-dom'],
    shareStrategy: 'loaded-first',
    dts: false,
  }),
  ```

  `shared` offers the shell's React 19 to the remotes. Insights asks for React 18, so it does not
  match and Insights loads its own React 18 next to the shell's React 19; Notes brings its own Vue. `shareStrategy: 'loaded-first'` keeps the remotes lazy: nothing is fetched before
  `/orders` opens.
- **Retrying.** A failed load resets the cached promise, so Retry starts again.

## The page wires everything

React 19 binds custom elements like an Angular template: properties and attributes go in, and
`on` plus the exact event name adds a listener. (Insights' own page, on React 18, needs refs for
the same elements; see [insights.md](insights.md).)

```tsx
<StatusFilter value={status} onChange={setStatus} />

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

<shop-order-stats
  refresh-key={String(refreshCount)}
  onstatusPicked={(event) => setStatus(event.detail.status)}
/>
<shop-order-notes order-id={orderId} onnoteAdded={(event) => log(event.detail.text)} />
<shop-activity-feed entries={entries} oncleared={clear} />
```

| Who | Does what | How the others learn |
| --- | --- | --- |
| The shell's own filter (React) | picks a status | `status` on the Angular list |
| React stat tile (Insights) | `statusPicked` | the shell's filter and the Angular list follow |
| Angular list (Orders) | `orderSelected` | the URL changes; the Angular detail and the Vue notes follow it |
| Vue notes (Notes) | `noteAdded` | the React feed logs it |
| Angular detail (Orders) | `orderUpdated` | `refresh-key` changes; the React counts reload |
| Angular detail (Orders) | `closed` | back to `/orders` |

Every event also goes into the activity feed. Browser back and forward move between orders,
because the selected order lives only in the URL.

## Failure stays local

Each element group sits in its own `RemoteGate`. If a remote's server is down, only its card
turns into "Orders is unavailable" with a Retry button. The other remotes, the dashboard and the
navigation keep working. Orders comes back with Retry; after an Insights or Notes outage, reload
the page. The dashboard has a route `errorElement` for when the API itself is down.

## Theme

`App` keeps the theme in state and writes `--shop-color-primary` on `:root`. Settings changes it
through the router's outlet context. Custom properties cross shadow roots, so the Angular, React
and Vue components recolour with the shell.

## Run it

```bash
docker compose up --build --watch backoffice-react    # http://localhost:4200
```

The API and all three remotes start with it.

## What to try

- `/dashboard` shows the counts and the open orders; the Network tab shows no request to 4201,
  4202 or 4402.
- An order link opens `/orders/<id>` with that order in the Angular detail and the Vue notes.
- The shell's filter changes the Angular list; a React tile changes the filter and the list.
- A row click changes the URL; the detail and the notes follow. Back and forward restore it.
- A Vue note appears in the React feed; "Mark as shipped" changes the React counts.
- In Settings, Orange recolours every component.
- Stop the `orders` container in Docker Desktop: only the Orders card shows the error; start it
  and press Retry.
