import type { INotesRemote, IRemoteConfig, NotesContracts } from '@shop/notes-contract';
import OrderNotes from './notes/components/order-notes/OrderNotes.vue';
import orderNotesStyles from './notes/components/order-notes/order-notes.css?inline';
import StatusFilter from './notes/components/status-filter/StatusFilter.vue';
import statusFilterStyles from './notes/components/status-filter/status-filter.css?inline';
import { createNotes } from './notes/config/create-notes';
import {
  type IVueElementOptions,
  type VueComponent,
  defineVueElement,
} from './web-components/define-vue-element';

type ContractFor<TTag> = Extract<NotesContracts, { tagName: TTag }>;

type ContractProps<TContract extends NotesContracts> = Partial<TContract['properties']> & {
  [K in keyof TContract['events'] as `on${Capitalize<K & string>}`]?: (
    detail: TContract['events'][K],
  ) => void;
};

type PropsOf<TComponent> = TComponent extends abstract new (...args: never) => { $props: infer P }
  ? P
  : never;

type MissingFrom<TComponent, TContract extends NotesContracts> = Exclude<
  keyof ContractProps<TContract>,
  keyof PropsOf<TComponent>
>;

type ImplementsContract<TComponent, TContract extends NotesContracts> = [
  MissingFrom<TComponent, TContract>,
] extends [never]
  ? PropsOf<TComponent> extends ContractProps<TContract>
    ? unknown
    : { contractTypes: ContractProps<TContract> }
  : { missingFromComponent: MissingFrom<TComponent, TContract> };

let elementsDefined: Promise<void> | undefined;

export const defineElements: INotesRemote['defineElements'] = (config) => {
  elementsDefined ??= Promise.resolve().then(() => registerElements(config));
  return elementsDefined;
};

function registerElements(config: IRemoteConfig): void {
  const notes = createNotes(config);

  defineNotesElement('shop-status-filter', StatusFilter, { styles: [statusFilterStyles] });
  defineNotesElement('shop-order-notes', OrderNotes, {
    styles: [orderNotesStyles],
    configureApp: (app) => app.use(notes),
  });
}

function defineNotesElement<TTag extends NotesContracts['tagName'], TComponent extends VueComponent>(
  tagName: TTag,
  component: TComponent & ImplementsContract<TComponent, ContractFor<TTag>>,
  options: IVueElementOptions,
): void {
  defineVueElement(tagName, component, options);
}
