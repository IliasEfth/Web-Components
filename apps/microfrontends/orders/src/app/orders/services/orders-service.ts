import { Injectable, inject, signal } from '@angular/core';
import type { IOrder, OrderStatus, OrderStatusFilter } from '@shop/api-contract';
import { type Observable, tap } from 'rxjs';
import { OrdersClient } from '../clients/orders-client';

@Injectable()
export class OrdersService {
  readonly #client = inject(OrdersClient);
  readonly #changeCount = signal(0);

  readonly changeCount = this.#changeCount.asReadonly();

  list(status: OrderStatusFilter): Observable<IOrder[]> {
    return this.#client.listOrders({ status });
  }

  get(id: string): Observable<IOrder> {
    return this.#client.getOrder({ id });
  }

  updateStatus(id: string, status: OrderStatus): Observable<IOrder> {
    return this.#client
      .updateOrderStatus({ id, status })
      .pipe(tap(() => this.#changeCount.update((count) => count + 1)));
  }
}
