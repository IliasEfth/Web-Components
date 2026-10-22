import type { OrderStatus, OrderStatusFilter } from '../contract/index.d.ts';

export type { IOrder, OrderStatus, OrderStatusFilter } from '../contract/index.d.ts';

export const orderStatuses: readonly OrderStatus[] = ['open', 'shipped'];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && orderStatuses.some((status) => status === value);
}

export function isOrderStatusFilter(value: unknown): value is OrderStatusFilter {
  return value === 'all' || isOrderStatus(value);
}
