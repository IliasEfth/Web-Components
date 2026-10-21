import type { OrderStatusFilter } from './order';

export interface IStatusChangeDetail {
  status: OrderStatusFilter;
}

export interface INoteAddedDetail {
  orderId: string;
  text: string;
}
