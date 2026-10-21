import type { OrderStatus, OrderStatusFilter } from './order';

export interface IOrderSelectedDetail {
  id: string;
}

export interface IOrderUpdatedDetail {
  id: string;
  status: OrderStatus;
}

export interface IOrderClosedDetail {
  id: string;
}

export interface IStatusPickedDetail {
  status: OrderStatusFilter;
}

export interface IStatusChangeDetail {
  status: OrderStatusFilter;
}

export interface INoteAddedDetail {
  orderId: string;
  text: string;
}
