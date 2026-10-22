import type { IListOrdersParams, IOrder, IOrdersApi } from '@shop/api-contract';

export class OrdersClient implements Pick<IOrdersApi, 'listOrders'> {
  readonly #apiBase: string;

  constructor(apiBase: string) {
    this.#apiBase = apiBase;
  }

  async listOrders(params: IListOrdersParams = {}, signal?: AbortSignal): Promise<IOrder[]> {
    const query = params.status ? `?status=${params.status}` : '';
    const response = await fetch(`${this.#apiBase}/orders${query}`, { signal });
    if (!response.ok) {
      throw new Error(`GET /orders failed with ${response.status}`);
    }
    return (await response.json()) as IOrder[];
  }
}
