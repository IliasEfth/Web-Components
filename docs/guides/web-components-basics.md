# Act 1: Web Components basics

`examples/web-components-basics` opens the talk. Three small components show the whole native
API before any framework appears. Each one is a single plain JavaScript file. Acts 2 and 3 use
exactly the same contract (attributes and properties in, `CustomEvent`s out), only written
with Angular, React and Vue.

| Component | Shows |
| --- | --- |
| `<user-card name role>` | `observedAttributes` and `attributeChangedCallback`: the page sets an attribute, the component re-renders |
| `<counter-button label start>` | A component telling the page something happened: `CustomEvent('count-changed', { detail: { count } })` |
| `<todo-list heading>` | A public method the page calls: `todoList.addItem('Milk')`; emits `item-added` |

`todo-list` takes `heading` rather than `title`, because `title` is a global HTML attribute and
would show as a tooltip over the whole component.

## The pattern

Every component does the same four things:

1. Build its DOM once in the constructor with `createElement`, and attach it to a Shadow Root.
2. Share one `CSSStyleSheet` between all instances through `adoptedStyleSheets`.
3. React to attribute changes in `attributeChangedCallback`.
4. Show values with `textContent`, so typed HTML is displayed, never run.

## Run it

```bash
docker compose up --build --watch web-components-basics
```

Open `http://localhost:4100` and follow act 1 of [the demo script](../showcase.md).

## Done when

- Typing a name updates the card.
- Clicking "Likes" updates the line below it with the new count.
- "Add Milk from the page" adds an item to the list.
- Typing `<img src=x onerror=alert(1)>` as the name shows it as text.
- `npm run lint` passes.
