import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { OrderDetail } from '../../orders/components/order-detail/order-detail';
import { OrderStatusSelect } from '../../orders/components/order-status-select/order-status-select';
import { OrdersList } from '../../orders/components/orders-list/orders-list';
import type { OrderStatusFilter } from '../../orders/models/order';
import type {
  IOrderClosedDetail,
  IOrderSelectedDetail,
  IOrderUpdatedDetail,
} from '../../orders/models/order-events';
import { EventLog } from '../../shared/event-log';

@Component({
  selector: 'app-components-page',
  templateUrl: './components-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdersList, OrderDetail, OrderStatusSelect, EventLog],
})
export class ComponentsPage {
  readonly status = signal<OrderStatusFilter>('all');
  readonly selectedOrderId = signal<string | undefined>(undefined);
  readonly events = signal<string[]>([]);

  selectOrder({ id }: IOrderSelectedDetail): void {
    this.selectedOrderId.set(id);
    this.#log(`(orderSelected) { id: ${id} }`);
  }

  orderUpdated({ id, status }: IOrderUpdatedDetail): void {
    this.#log(`(orderUpdated) { id: ${id}, status: ${status} }`);
  }

  closeOrder({ id }: IOrderClosedDetail): void {
    this.selectedOrderId.set(undefined);
    this.#log(`(closed) { id: ${id} }`);
  }

  #log(entry: string): void {
    this.events.update((events) => [entry, ...events]);
  }
}
