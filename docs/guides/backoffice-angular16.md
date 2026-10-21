# Act 2: the Angular 16 back office, an old host for new components

`apps/backoffices/backoffice-angular16` is the third shell, and it is old on purpose: Angular 16
with NgModules, Zone.js, `*ngIf`, `@Input()` and webpack, the way most Angular teams still work.
On its `/orders` page it hosts the latest Angular (Orders), React (Insights) and Vue (Notes).
Its colour is red (`#dc2626`).

| Route | What it shows |
| --- | --- |
| `http://localhost:4500/dashboard` | Plain Angular 16 with no remote: counts, revenue, and links to the open orders |
| `http://localhost:4500/orders` | All six elements, wired together by the shell |
| `http://localhost:4500/orders/A-1003` | The same page opened with an order (a deep link) |

## Created with the Angular 16 CLI

Angular 16 needs Node 18, so the project was created with nvm's Node 18 and analytics off:

```powershell
nvm use 18.20.8
$env:NG_CLI_ANALYTICS = 'false'
npx -y @angular/cli@16 new backoffice-angular16 --standalone=false --routing --style=css --skip-git --skip-tests
nvm use 24.22.0
```

`--standalone=false` gives the classic `AppModule` and `AppRoutingModule`. The image is
`node:18` as well, so `package-lock.json` and the container agree.

ESLint is added the Angular 16 way, which creates `.eslintrc.json` and the `lint` target:

```powershell
npx ng add @angular-eslint/schematics@16 --skip-confirmation
```

## The project

```text
src/app/
  app.module.ts               AppModule: BrowserModule, HttpClientModule, routing, REMOTE_CONFIG
  app-routing.module.ts       /dashboard, and /orders as a lazy OrdersModule
  app.component.*             header and navigation
  remote-entries.ts           where each remote lives
  models/                     the contract shapes and the REMOTE_CONFIG token
  services/
    remote-elements.service.ts   loads the three remotes, once each
    orders-client.service.ts     HttpClient for the dashboard
  dashboard/                  DashboardPageComponent (async pipe, *ngIf, *ngFor)
  orders/
    orders.module.ts          declares the page and the gate, CUSTOM_ELEMENTS_SCHEMA
    orders-routing.module.ts  one route for /orders and /orders/:orderId
    orders-page/              the page that wires the six elements
    remote-gate/              loading text, the content or an error card with Retry
```

The template's test setup (Karma, Jasmine, `tsconfig.spec.json`) is removed, and two browser
runtimes are added:

| Package | Why |
| --- | --- |
| `@softarc/native-federation-orchestrator` | Reads Orders' `remoteEntry.json`, writes the import map for Angular 22, imports `./elements` |
| `@module-federation/runtime` | Loads Insights' and Notes' `remoteEntry.js`; the runtime underneath `@module-federation/vite` |

**Why not `@angular-architects/native-federation`?** Its Angular 16 version brings a 2023 runtime
that cannot read the v4 `remoteEntry.json` Orders publishes, and it would replace the webpack
build. The shell exposes nothing and cannot share Angular 16 with Angular 22, so it needs no
federation build: only the two runtimes, in the browser.

## Loading three remotes in a webpack app

`RemoteElementsService` keeps one promise per remote and forgets it on failure, so Retry starts
again:

```ts
private readonly moduleFederation = createInstance({
  name: 'backoffice_angular16',
  remotes: [
    { name: 'insights', entry: remoteEntries.insights, type: 'module' },
    { name: 'notes', entry: remoteEntries.notes, type: 'module' },
  ],
  shared: {},
  shareStrategy: 'loaded-first',
});

loadOrders(): Promise<void> {
  return this.loadOnce('orders', async () => {
    const nativeFederation = await initFederation(
      { orders: remoteEntries.orders },
      {
        ...useDefaultImportMap(),
        loadModuleFn: (url: string) => import(/* webpackIgnore: true */ url),
      },
    );
    return nativeFederation.loadRemoteModule<IRemoteElements>('orders', './elements');
  });
}
```

- **`webpackIgnore`.** Webpack rewrites every `import()` it sees. The orchestrator's own import
  is only marked for Vite, so the shell hands it a `loadModuleFn` that webpack leaves alone. It
  is the one comment allowed in the code. The Module Federation runtime already marks its imports.
- **`shared: {}`.** The shell has no React and no Vue to offer, so each remote uses its own copy.
- **`moduleResolution: "bundler"`.** The CLI 16 template resolves packages the old `node` way,
  which ignores `exports`; the orchestrator's `/options` entry point needs `bundler`.

## The page wires everything

The router's single route uses a small `UrlMatcher`, so `/orders` and `/orders/A-1003` reuse
the same page and its activity feed. The order id comes from `route.paramMap` through the
`async` pipe.

```html
<app-remote-gate name="Orders" [load]="loadOrders">
  <ng-template>
    <shop-orders-list [attr.status]="status" page-size="10"
      (orderSelected)="orderSelected($event)"></shop-orders-list>
    <shop-order-detail [attr.order-id]="route.orderId"
      (orderUpdated)="orderUpdated($event)" (closed)="orderClosed($event)"></shop-order-detail>
  </ng-template>
</app-remote-gate>
```

- **`<ng-template>` inside the gate.** The elements are created only after their remote has
  defined them, through `*ngTemplateOutlet`.
- **`[attr.…]` for strings, `[entries]` for the array.** Exactly the contract: attributes for
  strings, a property for the feed.
- **`(statusChange)`, `(orderSelected)`, …** Angular listens to the DOM events by their exact
  names; the handlers read `(event as CustomEvent<…>).detail`.
- **`CUSTOM_ELEMENTS_SCHEMA`** on `OrdersModule` lets the template use the `shop-` tags.

Zone.js triggers change detection for every event and every resolved load, as in any Angular 16
app; the Angular 22 elements run zoneless inside the same page.

## Two Angular versions on one page

```js
document.querySelector('app-root').getAttribute('ng-version');         // 16.2.12
document.querySelector('shop-orders-list').getAttribute('ng-version'); // 22.2.3
```

## Run it

```bash
docker compose up --build --watch backoffice-angular16    # http://localhost:4500
```

`Dockerfile.dev` uses `node:18`, installs with `npm ci --ignore-scripts` and runs
`npm run start:docker` (`ng serve --host 0.0.0.0`, Docker only). The service waits for the API
and all three remotes.

## Done when

- Demo act 2.1: the Vue filter drives the Angular list; a React tile drives the Vue filter; a row
  click changes the URL and the detail and the notes follow; a Vue note reaches the React feed;
  "Mark as shipped" changes the React counts.
- Demo act 2.2: two different `ng-version` values on one page.
- Demo act 2.4: `docker compose stop orders` leaves only the Orders card failing; Retry recovers it.
- Everything is red, inside every shadow root too.
- `npm run build` passes; the only warnings are the two "Critical dependency" ones from the
  orchestrator. `npm run lint` passes.
