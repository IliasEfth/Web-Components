const styles = new CSSStyleSheet();
styles.replaceSync(`
  button {
    font: inherit;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #2563eb;
    color: #ffffff;
    cursor: pointer;
  }

  button:hover {
    background: #1d4ed8;
  }
`);

class CounterButton extends HTMLElement {
  static observedAttributes = ['label', 'start'];

  #count = 0;
  #label = document.createElement('span');
  #value = document.createElement('span');

  constructor() {
    super();
    const button = document.createElement('button');
    button.append(this.#label, ': ', this.#value);
    button.addEventListener('click', () => this.#increment());

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.adoptedStyleSheets = [styles];
    shadow.append(button);
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === 'start') {
      this.#count = Number(newValue) || 0;
    }
    this.#render();
  }

  #increment() {
    this.#count += 1;
    this.#render();
    this.dispatchEvent(
      new CustomEvent('count-changed', {
        detail: { count: this.#count },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #render() {
    this.#label.textContent = this.getAttribute('label') ?? 'Count';
    this.#value.textContent = String(this.#count);
  }
}

customElements.define('counter-button', CounterButton);
