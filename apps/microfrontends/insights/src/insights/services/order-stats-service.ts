import type { OrdersClient } from '../clients/orders-client';
import type { IOrderStats } from '../models/order-stats';

export class OrderStatsService {
  readonly #client: OrdersClient;

  constructor(client: OrdersClient) {
    this.#client = client;
  }

  async getStats(signal?: AbortSignal): Promise<IOrderStats> {
    const orders = await this.#client.listOrders({}, signal);
    const open = orders.filter((order) => order.status === 'open').length;
    return {
      open,
      shipped: orders.length - open,
      revenue: orders.reduce((sum, order) => sum + order.total, 0),
    };
  }
}
