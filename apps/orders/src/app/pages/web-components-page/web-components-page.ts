import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { OrderStatusSelect } from '../../orders/components/order-status-select/order-status-select';
import type { OrderStatusFilter } from '../../orders/models/order';
import type {
  IOrderClosedDetail,
  IOrderSelectedDetail,
  IOrderUpdatedDetail,
} from '../../orders/models/order-events';
import { EventLog } from '../../shared/event-log';

@Component({
  selector: 'app-web-components-page',
  templateUrl: './web-components-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderStatusSelect, EventLog],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WebComponentsPage {
  readonly status = signal<OrderStatusFilter>('all');
  readonly selectedOrderId = signal<string | null>(null);
  readonly events = signal<string[]>([]);

  selectOrder(event: Event): void {
    const { id } = (event as CustomEvent<IOrderSelectedDetail>).detail;
    this.selectedOrderId.set(id);
    this.#log(`orderSelected { id: ${id} }`);
  }

  orderUpdated(event: Event): void {
    const { id, status } = (event as CustomEvent<IOrderUpdatedDetail>).detail;
    this.#log(`orderUpdated { id: ${id}, status: ${status} }`);
  }

  closeOrder(event: Event): void {
    const { id } = (event as CustomEvent<IOrderClosedDetail>).detail;
    this.selectedOrderId.set(null);
    this.#log(`closed { id: ${id} }`);
  }

  #log(entry: string): void {
    this.events.update((events) => [entry, ...events]);
  }
}
