const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: block;
    font-family: system-ui, sans-serif;
  }

  h3 {
    margin: 0 0 8px;
  }

  form {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  input {
    flex: 1;
    padding: 6px 8px;
    font: inherit;
  }

  button {
    padding: 6px 12px;
    font: inherit;
    cursor: pointer;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  .empty {
    color: #6b7280;
  }
`);

class TodoList extends HTMLElement {
  static observedAttributes = ['heading'];

  #heading = document.createElement('h3');
  #input = document.createElement('input');
  #items = document.createElement('ul');
  #emptyMessage = document.createElement('p');

  constructor() {
    super();
    this.#input.placeholder = 'Add an item';
    this.#emptyMessage.className = 'empty';
    this.#emptyMessage.textContent = 'Nothing here yet.';

    const addButton = document.createElement('button');
    addButton.type = 'submit';
    addButton.textContent = 'Add';

    const form = document.createElement('form');
    form.append(this.#input, addButton);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.addItem(this.#input.value);
      this.#input.value = '';
      this.#input.focus();
    });

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.adoptedStyleSheets = [styles];
    shadow.append(this.#heading, form, this.#items, this.#emptyMessage);
  }

  attributeChangedCallback(_name, _oldValue, newValue) {
    this.#heading.textContent = newValue ?? '';
  }

  addItem(text) {
    const value = String(text).trim();
    if (!value) {
      return;
    }

    const item = document.createElement('li');
    item.textContent = value;
    this.#items.append(item);
    this.#emptyMessage.hidden = true;

    this.dispatchEvent(
      new CustomEvent('item-added', {
        detail: { text: value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define('todo-list', TodoList);
