import {
  type App,
  type Component,
  type ComponentObjectPropsOptions,
  defineCustomElement,
  h,
  toHandlerKey,
  useHost,
  version,
} from 'vue';

export type VueComponent = Component & {
  props?: object;
  emits?: readonly string[] | object;
};

export interface IVueElementOptions {
  styles?: string[];
  configureApp?: (app: App) => void;
}

export function defineVueElement(
  tagName: string,
  component: VueComponent,
  { styles, configureApp }: IVueElementOptions = {},
): void {
  if (customElements.get(tagName)) {
    return;
  }

  const eventNames = Array.isArray(component.emits)
    ? component.emits
    : Object.keys(component.emits ?? {});

  const element = defineCustomElement(
    {
      props: (component.props ?? {}) as ComponentObjectPropsOptions,
      styles,
      setup(props) {
        const host = useHost();
        host?.setAttribute('data-vue-version', version);
        const dispatchers = Object.fromEntries(
          eventNames.map((eventName) => [
            toHandlerKey(eventName),
            (detail: object) =>
              host?.dispatchEvent(
                new CustomEvent(eventName, { detail, bubbles: true, composed: true }),
              ),
          ]),
        );
        return () => h(component, { ...props, ...dispatchers });
      },
    },
    { configureApp },
  );

  customElements.define(tagName, element);
}
