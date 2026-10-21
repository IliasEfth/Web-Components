import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { IActivityEntry } from '../insights/models/activity-entry';
import type { IStatusPickedDetail } from '../insights/models/insights-events';

type CustomElementProps<TProps> = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> &
  TProps;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'shop-order-stats': CustomElementProps<{
        'refresh-key'?: string;
        onstatusPicked?: (event: CustomEvent<IStatusPickedDetail>) => void;
      }>;
      'shop-activity-feed': CustomElementProps<{
        entries?: IActivityEntry[];
        oncleared?: (event: CustomEvent<object>) => void;
      }>;
    }
  }
}
