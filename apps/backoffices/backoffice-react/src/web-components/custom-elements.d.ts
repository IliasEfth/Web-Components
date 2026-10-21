import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { IActivityEntry } from '../models/activity-entry';
import type {
  INoteAddedDetail,
  IOrderClosedDetail,
  IOrderSelectedDetail,
  IOrderUpdatedDetail,
  IStatusChangeDetail,
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
      'shop-status-filter': CustomElementProps<{
        value?: OrderStatusFilter;
        onstatusChange?: (event: CustomEvent<IStatusChangeDetail>) => void;
      }>;
      'shop-order-notes': CustomElementProps<{
        'order-id'?: string;
        onnoteAdded?: (event: CustomEvent<INoteAddedDetail>) => void;
      }>;
    }
  }
}
