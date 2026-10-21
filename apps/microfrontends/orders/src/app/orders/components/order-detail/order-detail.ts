import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import type { IOrder, OrderStatus } from '../../models/order';
import type { IOrderClosedDetail, IOrderUpdatedDetail } from '../../models/order-events';
import { OrdersService } from '../../services/orders-service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
})
export class OrderDetail {
  readonly orderId = input<string | null>();

  readonly orderUpdated = output<IOrderUpdatedDetail>();
  readonly closed = output<IOrderClosedDetail>();

  readonly #ordersService = inject(OrdersService);

  readonly saving = signal(false);
  readonly saveFailed = signal(false);

  readonly orderResource = rxResource({
    params: () => this.orderId() ?? undefined,
    stream: ({ params: id }) => this.#ordersService.get(id),
  });

  async toggleStatus(order: IOrder): Promise<void> {
    const status: OrderStatus = order.status === 'open' ? 'shipped' : 'open';
    this.saving.set(true);
    this.saveFailed.set(false);
    try {
      const updated = await firstValueFrom(this.#ordersService.updateStatus(order.id, status));
      this.orderResource.set(updated);
      this.orderUpdated.emit({ id: updated.id, status: updated.status });
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  close(order: IOrder): void {
    this.closed.emit({ id: order.id });
  }
}
