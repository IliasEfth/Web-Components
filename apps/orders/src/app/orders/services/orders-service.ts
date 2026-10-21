import { Injectable, inject, signal } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { OrdersClient } from '../clients/orders-client';
import type { IOrder, OrderStatus, OrderStatusFilter } from '../models/order';

@Injectable()
export class OrdersService {
  readonly #client = inject(OrdersClient);
  readonly #changeCount = signal(0);

  readonly changeCount = this.#changeCount.asReadonly();

  list(status: OrderStatusFilter): Observable<IOrder[]> {
    return this.#client.listOrders(status === 'all' ? undefined : status);
  }

  get(id: string): Observable<IOrder> {
    return this.#client.getOrder(id);
  }

  updateStatus(id: string, status: OrderStatus): Observable<IOrder> {
    return this.#client
      .updateOrder(id, { status })
      .pipe(tap(() => this.#changeCount.update((count) => count + 1)));
  }
}
