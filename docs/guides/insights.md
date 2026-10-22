# Act 2: Insights, from a React app to web components

`apps/microfrontends/insights` is a regular React application, created with `npm create vite@latest` (React +
TypeScript template). The same two components are then turned into custom elements without
changing a line inside them. The app shows both side by side:

| Route | What it shows |
| --- | --- |
| `http://localhost:4202/components` | Step 1: the components used by React, the normal way |
| `http://localhost:4202/web-components` | Step 2: the same components as `<shop-order-stats>` and `<shop-activity-feed>` |

## Step 1: a correct React app

```text
contract/                         @shop/insights-contract: what other apps may use
src/
  insights/                       everything about insights, grouped by kind
    models/
      order-stats.ts              IOrderStats
      component-props.ts          ComponentProps: a component's props from its element contract
    clients/
      orders-client.ts            OrdersClient: implements listOrders from @shop/api-contract (fetch)
    services/
      order-stats-service.ts      OrderStatsService: what the components use; calls the client
    config/
      InsightsProvider.tsx        creates the client and the service, provides them through context
      useOrderStatsService.ts     the hook components use to get the service
    components/
      order-stats/                OrderStats + order-stats.css
      activity-feed/              ActivityFeed + activity-feed.css
  pages/                          one page per route
  shared/useActivityLog.ts
  web-components/                 the transformation (step 2)
  elements.tsx                     defineElements(config)
  main.tsx  App.tsx  router.tsx  app-config.ts
```

**Configuration through context.** React's equivalent of Angular's providers is a context
provider. `main.tsx` wraps the app once:

```tsx
<InsightsProvider config={insightsConfig}>
  <RouterProvider router={router} />
</InsightsProvider>
```

`InsightsProvider` creates `OrdersClient` and `OrderStatsService` from the config, and components
ask for the service with `useOrderStatsService()`. No component receives a URL or a token.

**Components are plain React.** Props go in, callback props come out:

```tsx
<OrderStats refreshKey={String(refreshCount)} onStatusPicked={({ status }) => log(status)} />
<ActivityFeed entries={entries} onCleared={clear} />
```

They know nothing about custom elements, but their props come from the element contract the
team publishes: `ComponentProps<IOrderStatsContract>` turns its properties into props and each
event into an `on…` callback. Their CSS classes carry the component name (`order-stats__tile`), so
the same stylesheet works on the page and inside a shadow root.

`OrdersClient` implements the one API operation the app calls, from the API team's contract:
`class OrdersClient implements Pick<IOrdersApi, 'listOrders'>`.

## Step 2: the transformation to web components

React has no built-in equivalent of Angular Elements, so `web-components/define-react-element.ts`
does the job in about 90 lines, with no extra package:

| Option | What it does |
| --- | --- |
| `inputs: ['refreshKey']` | each value prop becomes an attribute (`refresh-key`, kebab case) and a property (`refreshKey`), like an Angular `input()` |
| `outputs: ['onStatusPicked']` | each callback prop dispatches a `CustomEvent` named without `on` (`statusPicked`), with `bubbles` and `composed`; the argument becomes `detail` |
| `styles` | the component's CSS, adopted by the element's shadow root |
| `wrap` | wraps the component in its provider, here `InsightsProvider` with the host's config |

The two lists are checked against the component's props, which come from the contract, so a
misspelled name, a value prop listed as an output, or a prop missing from the lists does not
compile. Add a property to `IOrderStatsContract` and `elements.tsx` stops with
`missingInputs: "<name>"` until the element exposes it. The types do not exist at runtime, which is
why the names are listed once.

The wrapper renders straight into the shadow root (`createRoot(shadowRoot)`). It also keeps a
property value that a host set before the element was defined, and unmounts
React only when the element really leaves the page, not when a host just moves it.

`elements.tsx` uses it for both tags:

```ts
export const defineElements: IInsightsRemote['defineElements'] = (config) => {
  elementsDefined ??= Promise.resolve().then(() => registerElements(config));
  return elementsDefined;
};
```

The components import their CSS normally for step 1; `elements.tsx` imports the same files with
Vite's `?inline` suffix, which gives the CSS as a string for the shadow root.

`main.tsx` awaits `defineElements(insightsConfig)` before rendering, so the tags exist before the
first route. The web components page then uses them like any host would:

```tsx
<shop-order-stats
  refresh-key={String(refreshCount)}
  onstatusPicked={(event) => log(`statusPicked { status: ${event.detail.status} }`)}
/>
<shop-activity-feed entries={entries} oncleared={clear} />
```

React 19 handles custom elements itself, much like an Angular template:

- **Data in:** `entries={entries}` is set as a property, because the element defines one with that
  name; `refresh-key` is set as an attribute.
- **Events out:** a prop starting with `on` becomes `addEventListener` for the rest of the name,
  **exactly as written**. `onstatusPicked` listens to `statusPicked`; `onStatusPicked` would
  listen to `StatusPicked`, which never fires. The handler receives the `CustomEvent`, with the
  value in `event.detail`.

`web-components/custom-elements.d.ts` builds the JSX typings for the two tags from the contract:
attributes, properties, and an `on<event>` prop per event, typed with its `detail`.

## Step 3: share it with Module Federation

To let the Vue, Angular 16 and React shells load `defineElements` at runtime, the app is also a
Module Federation remote. One dev dependency is added: `@module-federation/vite`.

```ts
federation({
  name: 'insights',
  filename: 'remoteEntry.js',
  exposes: {
    './elements': './src/elements.tsx',
  },
  shared: ['react', 'react-dom'],
  dts: false,
}),
```

- **`exposes`** publishes `elements.tsx` and nothing else: the shells get `defineElements`, never
  the app's pages or router.
- **`shared`** lets a React shell provide its own React; a Vue or Angular shell has none, so the
  remote falls back to its own copy.
- **`server.origin`** is set to `http://localhost:4202`, so the files the remote entry points to
  are always loaded from the remote, not from the shell's origin.

The same dev server on port 4202 serves the app and the remote:

| URL | What it is |
| --- | --- |
| `http://localhost:4202/components`, `/web-components` | the app, exactly as before |
| `http://localhost:4202/remoteEntry.js` | the Module Federation container, exposing `./elements` |

A shell built with Vite lists it as a remote of the same plugin and imports it like a module;
[backoffice-react.md](backoffice-react.md) shows the whole host:

```ts
federation({
  name: 'backoffice',
  remotes: {
    insights: { type: 'module', name: 'insights', entry: 'http://localhost:4202/remoteEntry.js' },
  },
  shared: ['react', 'react-dom'],
});

const { defineElements } = await import('insights/elements');
await defineElements({ apiBase: 'http://localhost:3000' });
```

**Two federation systems.** Orders uses Native Federation (`remoteEntry.json`), Insights uses
Module Federation (`remoteEntry.js`). The formats differ, so every shell uses both runtimes: one
loader per system, the same `defineElements` contract behind each.

## What changes for the host

| | React component (step 1) | Custom element (step 2) |
| --- | --- | --- |
| Tag | `<OrderStats>` | `<shop-order-stats>` |
| Usable from | this React app only | any page: Angular, Vue, Angular 16, plain HTML |
| Data in | props, typed | attribute `refresh-key`, property `entries` |
| Events out | `onStatusPicked(detail)` | `CustomEvent('statusPicked')`, value in `event.detail` |
| Configuration | `<InsightsProvider config>` | `defineElements({ apiBase })` once |

## Run it

```bash
docker compose up --build --watch insights    # http://localhost:4202
```

## What to try

- `/components` shows three tiles; a click logs `onStatusPicked(...)` in the feed; "Refresh
  statistics" reloads; "Clear" empties the feed.
- `/web-components` does the same with the custom elements and logs the DOM events.
- `http://localhost:4202/remoteEntry.js` is the container the shells load.