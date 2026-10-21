import type { IOrder } from '../models/order';

export class OrdersClient {
  readonly #apiBase: string;

  constructor(apiBase: string) {
    this.#apiBase = apiBase;
  }

  async list(signal?: AbortSignal): Promise<IOrder[]> {
    const response = await fetch(`${this.#apiBase}/orders`, { signal });
    if (!response.ok) {
      throw new Error(`GET /orders failed with ${response.status}`);
    }
    return (await response.json()) as IOrder[];
  }
}
