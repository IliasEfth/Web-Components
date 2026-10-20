# Web Components & Micro-Frontends

**One online shop back office. Five frameworks. One page.**

The orders list is Angular. The statistics are React. The status filter and the notes are Vue.
The page around them is React, Vue, Angular 16 or no framework at all, and you can swap it
without touching a single component. They never import each other: they meet only through
**custom elements**, the browser's own component model.

> This is the companion repository of the talk *Web Components & Micro-Frontends*.
> Every demo from the talk runs from here, and [docs/showcase.md](docs/showcase.md) is the
> script it follows.

## What the talk shows

| # | Demo | The point |
| --- | --- | --- |
| 1 | Three native components, no build | Web Components are a browser standard |
| 2 | `@shop/ui`, a design system in plain JavaScript | Write it once, every framework uses it |
| 3 | Angular, React and Vue exchanging data on one page | Attributes and properties down, events up |
| 4 | Angular 16 hosting a current Angular | Teams upgrade on their own schedule |
| 5 | The same components in a React, a Vue and an Angular host | The host owns theme and layout |
| 6 | One remote server stopped | One team's outage never blanks the page |
| 7 | The same components installed as an npm package, under a strict CSP | Nothing runs that you did not install |

## How it fits together

```mermaid
flowchart TB
  subgraph hosts[Hosts: own the URL, layout and theme]
    react[backoffice-react<br/>React 19 · :4200]
    vue[backoffice-vue<br/>Vue 3.5 · :4400]
    ng16[backoffice-angular16<br/>Angular 16 · :4500]
    vanilla[backoffice-vanilla<br/>no framework, strict CSP · :4600]
  end

  subgraph remotes[Remotes: ship features as custom elements]
    orders[orders · Angular · :4201<br/>shop-orders-list<br/>shop-order-detail]
    insights[insights · React · :4202<br/>shop-order-stats<br/>shop-activity-feed]
    notes[notes · Vue · :4402<br/>shop-status-filter<br/>shop-order-notes]
  end

  ui[[packages/ui · @shop/ui · :4300<br/>ui-button ui-card ui-badge ui-data-table]]
  pkg[[packages/orders-elements<br/>@shop/orders-elements]]
  api[(tools/mock-api · :3000<br/>/orders)]

  react & vue & ng16 -- "import() at runtime" --> orders & insights & notes
  orders -- "npm pack" --> pkg
  vanilla -- "npm install" --> pkg
  orders & insights & notes -- fetch --> api
  hosts -. "render with" .-> ui
  remotes -. "render with" .-> ui
```

The whole contract between teams is a short table of tag names, attributes and events, in
[docs/architecture.md](docs/architecture.md#contracts):

```html
<shop-orders-list status="open" api-base="http://localhost:3000"></shop-orders-list>
```

```js
list.addEventListener('orderSelected', (event) => {
  detail.setAttribute('order-id', event.detail.id);
});
```

## Repository layout

```text
apps/
  backoffice-react/       host       React 19 + React Router
  backoffice-vue/         host       Vue 3.5 + Vue Router
  backoffice-angular16/   host       Angular 16 + Zone.js
  backoffice-vanilla/     host       plain JavaScript, strict CSP
  orders/                 remote     current Angular, zoneless, Native Federation
  insights/               remote     React 19
  notes/                  remote     Vue 3.5
packages/
  ui/                     @shop/ui, the shared design system
  orders-elements/        @shop/orders-elements, the Orders remote as a package
examples/
  web-components-basics/  the warm-up demo
tools/
  mock-api/               the orders REST API
docs/                     architecture, demo script, one build guide per app
```

Every folder is its own npm project with its own `package.json`, as if a different team owned
each one.

## Run it

You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/). No Node.js,
no Angular CLI, no version manager: every app builds and runs in its own container, and the
Angular 16 host simply uses a Node 18 image.

```bash
docker compose up --build --watch
```

`--watch` copies every edit into the running containers, so the code on screen and the page
in the browser stay in step. `docker compose down` stops everything, and
`docker compose up -d --force-recreate mock-api` puts the orders back to their starting state
after a demo.

| Port | Project | Open |
| --- | --- | --- |
| 3000 | `tools/mock-api` | `http://localhost:3000/orders` |
| 4100 | `examples/web-components-basics` | demo 1 |
| 4300 | `packages/ui` | demo 2 |
| 4500 | `apps/backoffice-angular16` | demos 3, 4, 6: `http://localhost:4500/orders` |
| 4400 | `apps/backoffice-vue` | demo 5 |
| 4200 | `apps/backoffice-react` | demo 5 |
| 4600 | `apps/backoffice-vanilla` | demo 7 |
| 4201, 4202, 4402 | `apps/orders`, `apps/insights`, `apps/notes` | the remotes the hosts load |

## Status

The apps are being added one at a time, each through its own pull request.

| Stage | Adds | State |
| --- | --- | --- |
| 1 | Docs, mock API, editor settings, Docker Compose | in review |
| 2 | `@shop/ui` and the warm-up demo | next |
| 3 | `orders` (Angular remote) | planned |
| 4 | `insights` (React remote) | planned |
| 5 | `backoffice-react` | planned |
| 6 | `notes` and `backoffice-vue` | planned |
| 7 | `backoffice-angular16` | planned |
| 8 | `@shop/orders-elements` and `backoffice-vanilla` | planned |
| 9 | Production images for the demo | planned |
| 10 | Windows shortcuts | planned |

## Tech stack

| Layer | Technology |
| --- | --- |
| Contract | Custom elements: attributes, properties, `CustomEvent`s |
| Styling | Shadow DOM and `--shop-*` CSS custom properties |
| Loading | Native Federation (Angular), ESM `import()` (React, Vue), or an installed package |
| Safety | `textContent` everywhere, one error boundary per remote, strict CSP with packaged components |
| Code style | Strict TypeScript, ESLint, VS Code's built-in formatters |
