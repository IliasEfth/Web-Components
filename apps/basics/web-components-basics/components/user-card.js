const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: block;
  }

  .card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    background: #ffffff;
    font-family: system-ui, sans-serif;
  }

  .name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .role {
    margin: 4px 0 0;
    color: #6b7280;
  }
`);

class UserCard extends HTMLElement {
  static observedAttributes = ['name', 'role'];

  #name = document.createElement('p');
  #role = document.createElement('p');

  constructor() {
    super();
    this.#name.className = 'name';
    this.#role.className = 'role';

    const card = document.createElement('div');
    card.className = 'card';
    card.append(this.#name, this.#role);

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.adoptedStyleSheets = [styles];
    shadow.append(card);
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  #render() {
    this.#name.textContent = this.getAttribute('name') || 'Unknown';
    this.#role.textContent = this.getAttribute('role') ?? '';
  }
}

customElements.define('user-card', UserCard);
