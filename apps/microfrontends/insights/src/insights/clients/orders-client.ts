import type { IInsightsConfig } from '../config/insights-config';
import type { IOrder } from '../models/order';

export class OrdersClient {
  readonly #config: IInsightsConfig;

  constructor(config: IInsightsConfig) {
    this.#config = config;
  }

  async listOrders(signal?: AbortSignal): Promise<IOrder[]> {
    const response = await fetch(`${this.#config.apiBase}/orders`, {
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
