# Act 2: Notes, from a Vue app to web components

`apps/microfrontends/notes` is a regular Vue application, created with `npm create vite@latest` (Vue +
TypeScript template). The same two components are then turned into custom elements without
changing a line inside them. The app shows both side by side:

| Route | What it shows |
| --- | --- |
| `http://localhost:4402/components` | Step 1: the components used by Vue, the normal way |
| `http://localhost:4402/web-components` | Step 2: the same components as `<shop-status-filter>` and `<shop-order-notes>` |

## Step 1: a correct Vue app

```text
src/
  notes/                          everything about notes, grouped by kind
    models/
      order.ts                    OrderStatus, OrderStatusFilter
      note.ts                     INote
      notes-events.ts             IStatusChangeDetail, INoteAddedDetail
    clients/
      notes-client.ts             NotesClient: GET and POST /orders/:id/notes
    services/
      notes-service.ts            NotesService: what the components use; calls the client
    config/
      notes-config.ts             INotesConfig
      create-notes.ts             createNotes(config): a Vue plugin that provides the service
      use-notes-service.ts        inject() for components
    components/
      status-filter/              StatusFilter.vue + status-filter.css
      order-notes/                OrderNotes.vue + order-notes.css
  pages/                          one page per route
  shared/                         EventLog, OrderPicker, useEventLog
  web-components/                 the transformation (step 2)
  elements.ts                     defineElements(config)
  main.ts  App.vue  router.ts  app-config.ts
```

The template adds two packages: `vue-router` for the two routes, and `@module-federation/vite`
for step 3. `oxlint` is added for `npm run lint`, because the Vue template has no linter.

**Configuration through a plugin.** Vue's way to provide app-wide services is a plugin, like
`app.use(router)`. `main.ts` installs it once:

```ts
createApp(App).use(router).use(createNotes(notesConfig)).mount('#app');
```

`createNotes` builds `NotesClient` and `NotesService` from the config and `provide`s the service.
Components get it with `useNotesService()`, which is `inject` underneath. No component receives a
URL or a token.

**Components are plain Vue.** Props go in, emits come out:

```vue
<StatusFilter :value="status" @status-change="changeStatus" />
<OrderNotes :order-id="orderId" @note-added="noteAdded" />
```

Their CSS lives in a file next to them (`<style src="./status-filter.css">`), with class names
that carry the component name, so the same file works on the page and inside a shadow root.

## Step 2: the transformation to web components

Vue ships `defineCustomElement`, so most of the work is built in: props become attributes and
properties, the styles go into a shadow root, and `configureApp` installs plugins on the
element's own app. Only the events need help. Vue dispatches an emit as
`new CustomEvent(name, { detail: [...args] })`: the detail is an array, and the event neither
bubbles nor crosses the shadow root. The contract needs `detail: { status }` with `bubbles` and
`composed`.

`web-components/define-vue-element.ts` therefore wraps the component in about 50 lines:

| Part | What it does |
| --- | --- |
| `props: component.props` | the element gets exactly the component's props: `value`, `order-id` / `orderId` |
| `component.emits` | for each declared emit, a handler that dispatches the contract `CustomEvent` from the host element (`useHost()`) |
| `styles` | the component's CSS, imported with Vite's `?inline` suffix |
| `configureApp` | here `app.use(notes)`, the same plugin the app uses |

The emit names come from the compiled component, so nothing is listed twice.

`elements.ts` uses it for both tags:

```ts
function registerElements(config: INotesConfig): void {
  const notes = createNotes(config);

  defineVueElement('shop-status-filter', StatusFilter, { styles: [statusFilterStyles] });
  defineVueElement('shop-order-notes', OrderNotes, {
    styles: [orderNotesStyles],
    configureApp: (app) => app.use(notes),
  });
}
```

`main.ts` awaits `defineElements(notesConfig)` before mounting, and the web components page uses
the tags like any host would:

```vue
<shop-status-filter :value="status" @statusChange="changeStatus" />
<shop-order-notes :order-id="orderId" @noteAdded="noteAdded" />
```

- **`isCustomElement`** in `vite.config.ts` tells the Vue compiler that `shop-` tags are custom
  elements, not Vue components.
- **Data in:** Vue sets `:value` as a property, because the element defines one, and `:order-id`
  as an attribute.
- **Events out:** on a plain element, `@statusChange` listens to `statusChange` exactly as
  written. The handler receives the `CustomEvent`, with the value in `event.detail`.

## Step 3: share it with Module Federation

The same plugin as Insights, with Vue shared instead of React:

```ts
federation({
  name: 'notes',
  filename: 'remoteEntry.js',
  exposes: {
    './elements': './src/elements.ts',
  },
  shared: ['vue'],
  dts: false,
}),
```

`server.origin` is `http://localhost:4402`, so the files the remote entry points to always load
from Notes, whichever page imports it.

## The API

The notes are stored by `tools/mock-api` next to the orders:

| Request | Result |
| --- | --- |
| `GET /orders/A-1001/notes` | the notes of one order, or a 404 |
| `POST /orders/A-1001/notes` `{ "text": "Call first" }` | the new note, `201` |

## What changes for the host

| | Vue component (step 1) | Custom element (step 2) |
| --- | --- | --- |
| Tag | `<StatusFilter>` | `<shop-status-filter>` |
| Usable from | this Vue app only | any page: Angular, React, Angular 16, plain HTML |
| Data in | props, typed | attributes `value`, `order-id` |
| Events out | `emit('statusChange', detail)` | `CustomEvent('statusChange')`, value in `event.detail` |
| Configuration | `app.use(createNotes(config))` | `defineElements({ apiBase })` once |

## Run it

`Dockerfile.dev` follows the same pattern as the React apps: `npm ci --ignore-scripts`, then
`npm run dev -- --host`.

```bash
docker compose up --build --watch notes    # http://localhost:4402
```

## Done when

- `/components`: the filter logs `statusChange(...)`; picking an order loads its notes; adding a
  note logs `noteAdded(...)`.
- `/web-components` does the same with the custom elements and logs the DOM events.
- From another origin, `remoteEntry.js` → `get('./elements')` gives `defineElements`; both tags
  work; each event's `detail` is an object, with `bubbles` and `composed`.
- A note typed as `<img src=x onerror=alert(1)>` shows as text.
- `npm run build` and `npm run lint` pass.
