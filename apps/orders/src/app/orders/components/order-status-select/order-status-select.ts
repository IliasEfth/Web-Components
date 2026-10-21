import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import type { OrderStatusFilter } from '../../models/order';

@Component({
  selector: 'app-order-status-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="status-filter">
      Status
      <select [value]="status()" (change)="changeStatus($event)">
        <option value="all">All</option>
        <option value="open">Open</option>
        <option value="shipped">Shipped</option>
      </select>
    </label>
  `,
})
export class OrderStatusSelect {
  readonly status = model<OrderStatusFilter>('all');

  changeStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as OrderStatusFilter);
  }
}
