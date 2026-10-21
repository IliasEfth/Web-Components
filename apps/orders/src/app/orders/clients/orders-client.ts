import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ORDERS_CONFIG } from '../config/orders-config';
import type { IOrder, OrderStatus } from '../models/order';

@Injectable()
export class OrdersClient {
  readonly #http = inject(HttpClient);
  readonly #config = inject(ORDERS_CONFIG);

  listOrders(status?: OrderStatus): Observable<IOrder[]> {
    return this.#http.get<IOrder[]>(`${this.#config.apiBase}/orders`, {
      params: status ? { status } : {},
      headers: this.#headers(),
    });
  }

  getOrder(id: string): Observable<IOrder> {
    return this.#http.get<IOrder>(this.#orderUrl(id), { headers: this.#headers() });
  }

  updateOrder(id: string, changes: Pick<IOrder, 'status'>): Observable<IOrder> {
    return this.#http.patch<IOrder>(this.#orderUrl(id), changes, { headers: this.#headers() });
  }

  #orderUrl(id: string): string {
    return `${this.#config.apiBase}/orders/${encodeURIComponent(id)}`;
  }

  #headers(): Record<string, string> {
    const authToken = this.#config.getAuthToken?.();
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }
}
