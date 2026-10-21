import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { IActivityEntry } from '../models/activity-entry';
import type {
  IOrderClosedDetail,
  IOrderSelectedDetail,
  IOrderUpdatedDetail,
  IStatusPickedDetail,
} from '../models/element-events';
import type { OrderStatusFilter } from '../models/order';

type CustomElementProps<TProps> = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> &
  TProps;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'shop-orders-list': CustomElementProps<{
        status?: OrderStatusFilter;
        'page-size'?: string;
        onorderSelected?: (event: CustomEvent<IOrderSelectedDetail>) => void;
      }>;
      'shop-order-detail': CustomElementProps<{
        'order-id'?: string;
        onorderUpdated?: (event: CustomEvent<IOrderUpdatedDetail>) => void;
        onclosed?: (event: CustomEvent<IOrderClosedDetail>) => void;
      }>;
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
