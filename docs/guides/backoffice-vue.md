# Act 2: the Vue back office, hosting all three frameworks

`apps/backoffices/backoffice-vue` is the second shell: a Vue app (`npm create vite@latest`,
Vue + TypeScript template) that puts the Angular components from Orders, the React components
from Insights and the Vue components from Notes on one page. It imports none of them. All three
are loaded at runtime, the first time `/orders` opens. Its colour is green (`#16a34a`).

| Route | What it shows |
| --- | --- |
| `http://localhost:4400/dashboard` | Plain Vue with no remote: counts, revenue, and links to the open orders |
| `http://localhost:4400/orders` | All six elements, wired together by the shell |
| `http://localhost:4400/orders/A-1003` | The same page opened with an order (a deep link) |
| `http://localhost:4400/settings` | The theme switch |

It has the same pages and layout as [backoffice-react](backoffice-react.md), so this guide shows
what is different.

## The project

```text
src/
  remote-entries.ts          where each remote lives (also read by vite.config.ts)
  app-config.ts              the configuration every remote receives: { apiBase }
  remotes/
    orders-remote.ts         Native Federation
    insights-remote.ts       Module Federation
    notes-remote.ts          Module Federation
    RemoteGate.vue           loading text, then the slot or an error card with Retry
    remote-modules.d.ts      the types of 'insights/elements' and 'notes/elements'
  models/                    the contract shapes, including the Notes events
  clients/orders-client.ts   the dashboard's own fetch
  pages/                     DashboardPage.vue, OrdersPage.vue, SettingsPage.vue
  theme/themes.ts            the three themes and the injection key
  shared/use-activity-log.ts
  App.vue  router.ts  main.ts  styles.css
```

The same packages as the React shell, in their Vue versions: `vue-router`,
`@softarc/native-federation-orchestrator` and `@module-federation/vite`.

## Three remotes, two runtimes

```ts
federation({
  name: 'backoffice_vue',
  remotes: {
    insights: { type: 'module', name: 'insights', entry: remoteEntries.insights },
    notes: { type: 'module', name: 'notes', entry: remoteEntries.notes },
  },
  shared: ['vue'],
  shareStrategy: 'loaded-first',
  dts: false,
}),
```

- **`shared: ['vue']`** gives Notes the shell's Vue, so one Vue runs on the page. Insights
  shares React, which this shell does not have, so Insights falls back to its own copy.
- **Orders** is loaded by the orchestrator, exactly as in the React shell.
- **`isCustomElement`** for `shop-` tags tells the Vue compiler that they are not Vue components.

## The page wires everything

```vue
<shop-status-filter :value="status" @statusChange="statusChanged" />

<shop-orders-list :status="status" page-size="10" @orderSelected="orderSelected" />
<shop-order-detail :order-id="orderId" @orderUpdated="orderUpdated" @closed="orderClosed" />

<shop-order-stats :refresh-key="String(refreshCount)" @statusPicked="statusPicked" />
<shop-order-notes :order-id="orderId" @noteAdded="noteAdded" />
<shop-activity-feed :entries="entries" @cleared="clear" />
```

The router passes the order id as a prop (`props: true` on `/orders/:orderId?`), so the page reads
it like any other input and hands it to two elements from two frameworks.

| Who | Does what | How the others learn |
| --- | --- | --- |
| Vue filter (Notes) | `statusChange` | `status` on the Angular list |
| React stat tile (Insights) | `statusPicked` | the Vue filter and the Angular list follow |
| Angular list (Orders) | `orderSelected` | the URL changes; the Angular detail and the Vue notes follow it |
| Vue notes (Notes) | `noteAdded` | the React feed logs it |
| Angular detail (Orders) | `orderUpdated` | `refresh-key` changes; the React counts reload |
| Angular detail (Orders) | `closed` | back to `/orders` |

On a plain element, Vue keeps the event name exactly as written, so `@statusChange` listens to
`statusChange`. The handlers receive the `CustomEvent` and read `event.detail`.

## Failure stays local

Each element group sits in a `RemoteGate`. With `docker compose stop orders`, only the Orders card
shows "Orders is unavailable"; the Vue filter, the notes and the React statistics keep working,
and Retry recovers after `docker compose start orders`. As in the React shell, a Module
Federation remote that was down recovers on a page reload.

## Theme

`App.vue` keeps the theme in a `ref`, writes `--shop-color-primary` on `:root` with
`watchEffect`, and `provide`s the ref. `SettingsPage.vue` `inject`s it and changes it. Custom
properties cross shadow roots, so every component recolours with the shell.

## Run it

```bash
docker compose up --build --watch backoffice-vue    # http://localhost:4400
```

The API and all three remotes start with it.

## What to try

- `/dashboard` shows the counts and the open orders; the Network tab shows no request to 4201,
  4202 or 4402.
- An order link opens `/orders/<id>` with that order in the Angular detail and the Vue notes.
- The Vue filter changes the Angular list; a React tile changes the Vue filter and the list.
- A row click changes the URL; the detail and the notes follow.
- A Vue note appears in the React feed; "Mark as shipped" changes the React counts.
- Everything is green, inside every shadow root too; in Settings, Orange recolours every component.
- `docker compose stop orders`: only the Orders card fails; Retry recovers it.
