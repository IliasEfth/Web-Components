import type { InsightsContracts } from '@shop/insights-contract';
import type { NotesContracts } from '@shop/notes-contract';
import type { OrdersContracts } from '@shop/orders-contract';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

interface IElementContract {
  tagName: string;
  attributes: object;
  properties: object;
  events: object;
}

type ElementProps<TContract extends IElementContract> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Partial<TContract['attributes']> &
  Partial<TContract['properties']> & {
    [K in keyof TContract['events'] as `on${K & string}`]?: (
      event: CustomEvent<TContract['events'][K]>,
    ) => void;
  };

type ContractElements<TContracts extends IElementContract> = {
  [TContract in TContracts as TContract['tagName']]: ElementProps<TContract>;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements
      extends ContractElements<OrdersContracts | InsightsContracts | NotesContracts> {}
  }
}
