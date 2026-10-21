import OrderNotes from './notes/components/order-notes/OrderNotes.vue';
import orderNotesStyles from './notes/components/order-notes/order-notes.css?inline';
import StatusFilter from './notes/components/status-filter/StatusFilter.vue';
import statusFilterStyles from './notes/components/status-filter/status-filter.css?inline';
import { createNotes } from './notes/config/create-notes';
import type { INotesConfig } from './notes/config/notes-config';
import { defineVueElement } from './web-components/define-vue-element';

let elementsDefined: Promise<void> | undefined;

export async function defineElements(config: INotesConfig): Promise<void> {
  elementsDefined ??= Promise.resolve().then(() => registerElements(config));
  return elementsDefined;
}

function registerElements(config: INotesConfig): void {
  const notes = createNotes(config);

  defineVueElement('shop-status-filter', StatusFilter, { styles: [statusFilterStyles] });
  defineVueElement('shop-order-notes', OrderNotes, {
    styles: [orderNotesStyles],
    configureApp: (app) => app.use(notes),
  });
}
