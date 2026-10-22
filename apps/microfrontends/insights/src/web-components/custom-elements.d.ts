import type { InsightsContracts } from '@shop/insights-contract';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

interface IElementContract {
  tagName: string;
  attributes: object;
}

type ElementProps<TContract extends IElementContract> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Partial<TContract['attributes']>;

type ContractElements<TContracts extends IElementContract> = {
  [TContract in TContracts as TContract['tagName']]: ElementProps<TContract>;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ContractElements<InsightsContracts> {}
  }
}
