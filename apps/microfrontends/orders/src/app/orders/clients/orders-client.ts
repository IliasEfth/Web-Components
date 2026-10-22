import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  IListOrdersParams,
  IOrder,
  IOrderParams,
  IOrdersApi,
  IUpdateOrderStatusParams,
} from '@shop/api-contract';
import type { Observable } from 'rxjs';
import { ORDERS_CONFIG } from '../config/orders-config';
import type { ObservableApi } from './observable-api';

@Injectable()
export class OrdersClient
  implements ObservableApi<Pick<IOrdersApi, 'listOrders' | 'getOrder' | 'updateOrderStatus'>>
{
  readonly #http = inject(HttpClient);
  readonly #config = inject(ORDERS_CONFIG);

  listOrders(params: IListOrdersParams = {}): Observable<IOrder[]> {
    return this.#http.get<IOrder[]>(`${this.#config.apiBase}/orders`, {
      params: params.status ? { status: params.status } : {},
    });
  }

  getOrder({ id }: IOrderParams): Observable<IOrder> {
    return this.#http.get<IOrder>(this.#orderUrl(id));
  }

  updateOrderStatus({ id, status }: IUpdateOrderStatusParams): Observable<IOrder> {
    return this.#http.patch<IOrder>(this.#orderUrl(id), { status });
  }

  #orderUrl(id: string): string {
    return `${this.#config.apiBase}/orders/${encodeURIComponent(id)}`;
  }
}
