import type { IListOrdersParams, IOrder, IOrdersApi } from '@shop/api-contract';
import type { IRemoteConfig } from '@shop/insights-contract';

export class OrdersClient implements Pick<IOrdersApi, 'listOrders'> {
  readonly #config: IRemoteConfig;

  constructor(config: IRemoteConfig) {
    this.#config = config;
  }

  async listOrders(params: IListOrdersParams = {}, signal?: AbortSignal): Promise<IOrder[]> {
    const query = params.status ? `?status=${params.status}` : '';
    const response = await fetch(`${this.#config.apiBase}/orders${query}`, {
      headers: this.#headers(),
      signal,
    });
    if (!response.ok) {
      throw new Error(`GET /orders failed with ${response.status}`);
    }
    return (await response.json()) as IOrder[];
  }

  #headers(): Record<string, string> {
    const authToken = this.#config.getAuthToken?.();
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }
}
