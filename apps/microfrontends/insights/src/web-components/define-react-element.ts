import { type ComponentType, type ReactNode, createElement } from 'react';
import { type Root, createRoot } from 'react-dom/client';

type CallbackProp<TProps> = {
  [Key in keyof TProps]-?: NonNullable<TProps[Key]> extends (...args: never[]) => unknown
    ? Key
    : never;
}[keyof TProps] &
  string;

type ValueProp<TProps> = Exclude<keyof TProps, CallbackProp<TProps>> & string;

type MissingFrom<TKeys, TList extends readonly unknown[]> = Exclude<TKeys, TList[number]>;

type RequireEvery<TKeys, TList extends readonly unknown[], TLabel extends string> = [
  MissingFrom<TKeys, TList>,
] extends [never]
  ? unknown
  : { [Label in TLabel]: MissingFrom<TKeys, TList> };

export interface IReactElementOptions<TInputs, TOutputs> {
  inputs: TInputs;
  outputs: TOutputs;
  styles?: string;
  wrap?: (element: ReactNode) => ReactNode;
}

export function defineReactElement<
  TProps extends object,
  const TInputs extends readonly ValueProp<TProps>[],
  const TOutputs extends readonly CallbackProp<TProps>[],
>(
  tagName: string,
  component: ComponentType<TProps>,
  options: IReactElementOptions<TInputs, TOutputs> &
    RequireEvery<ValueProp<TProps>, TInputs, 'missingInputs'> &
    RequireEvery<CallbackProp<TProps>, TOutputs, 'missingOutputs'>,
): void {
  if (customElements.get(tagName)) {
    return;
  }

  const inputs: readonly string[] = options.inputs;
  const outputs: readonly string[] = options.outputs;
  const attributes = new Map(inputs.map((input) => [toAttributeName(input), input]));
  const wrap = options.wrap ?? ((element: ReactNode) => element);
  const styles = new CSSStyleSheet();
  styles.replaceSync(options.styles ?? '');

  class ReactElement extends HTMLElement {
    static observedAttributes = [...attributes.keys()];

    readonly #props: Record<string, unknown> = {};
    readonly #shadow: ShadowRoot;
    #root: Root | undefined;

    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: 'open' });
      this.#shadow.adoptedStyleSheets = [styles];

      for (const output of outputs) {
        const eventName = toEventName(output);
        this.#props[output] = (detail: unknown = {}) => {
          this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
        };
      }
      for (const input of inputs) {
        this.#defineProperty(input);
      }
    }

    connectedCallback(): void {
      this.#root ??= createRoot(this.#shadow);
      this.#render();
    }

    disconnectedCallback(): void {
      queueMicrotask(() => {
        if (!this.isConnected) {
          this.#root?.unmount();
          this.#root = undefined;
        }
      });
    }

    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
      const prop = attributes.get(name);
      if (prop) {
        this.#props[prop] = newValue ?? undefined;
        this.#render();
      }
    }

    #defineProperty(name: string): void {
      const valueSetBeforeUpgrade: unknown = Object.hasOwn(this, name)
        ? Reflect.get(this, name)
        : undefined;
      Reflect.deleteProperty(this, name);

      Object.defineProperty(this, name, {
        get: () => this.#props[name],
        set: (value: unknown) => {
          this.#props[name] = value;
          this.#render();
        },
        configurable: true,
        enumerable: true,
      });

      if (valueSetBeforeUpgrade !== undefined) {
        this.#props[name] = valueSetBeforeUpgrade;
      }
    }

    #render(): void {
      this.#root?.render(wrap(createElement(component, this.#props as unknown as TProps)));
    }
  }

  customElements.define(tagName, ReactElement);
}

function toAttributeName(prop: string): string {
  return prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function toEventName(callbackProp: string): string {
  const name = callbackProp.replace(/^on/, '');
  return name.charAt(0).toLowerCase() + name.slice(1);
}
