export const orderStatuses = ['open', 'shipped'] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type OrderStatusFilter = OrderStatus | 'all';

export interface IOrder {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && orderStatuses.some((status) => status === value);
}

export function isOrderStatusFilter(value: unknown): value is OrderStatusFilter {
  return value === 'all' || isOrderStatus(value);
}
