import type { OrderStatus } from './order';

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
