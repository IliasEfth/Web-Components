export type OrderStatus = 'open' | 'shipped';

export type OrderStatusFilter = OrderStatus | 'all';

export interface IOrder {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}
