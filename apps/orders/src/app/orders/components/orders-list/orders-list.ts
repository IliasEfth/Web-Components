import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { IOrder, OrderStatusFilter } from '../../models/order';
import type { IOrderSelectedDetail } from '../../models/order-events';
import { OrdersService } from '../../services/orders-service';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.css',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
})
export class OrdersList {
  readonly status = input<OrderStatusFilter>('all');
  readonly pageSize = input(20, { transform: numberAttribute });

  readonly orderSelected = output<IOrderSelectedDetail>();

  readonly #ordersService = inject(OrdersService);

  readonly ordersResource = rxResource({
    params: () => ({ status: this.status(), changeCount: this.#ordersService.changeCount() }),
    stream: ({ params }) => this.#ordersService.list(params.status),
    defaultValue: [],
  });

  readonly visibleOrders = computed(() => this.ordersResource.value().slice(0, this.pageSize()));

  select(order: IOrder): void {
    this.orderSelected.emit({ id: order.id });
  }
}
