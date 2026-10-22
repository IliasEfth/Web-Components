import type { IListOrdersParams, IOrder, IOrdersApi } from '@shop/api-contract';
import type { IInsightsConfig } from '../config/insights-config';

export class OrdersClient implements Pick<IOrdersApi, 'listOrders'> {
  readonly #config: IInsightsConfig;

  constructor(config: IInsightsConfig) {
    this.#config = config;
  }

  async listOrders(params: IListOrdersParams = {}, signal?: AbortSignal): Promise<IOrder[]> {
    const query = params.status ? `?status=${params.status}` : '';
    const response = await fetch(`${this.#config.apiBase}/orders${query}`, { signal });
    if (!response.ok) {
      throw new Error(`GET /orders failed with ${response.status}`);
    }
    return (await response.json()) as IOrder[];
  }
}
