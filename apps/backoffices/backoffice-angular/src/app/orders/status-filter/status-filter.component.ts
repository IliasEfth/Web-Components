import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { OrderStatusFilter } from '@shop/orders-contract';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  standalone: false,
})
export class StatusFilterComponent {
  @Input() value: OrderStatusFilter = 'all';
  @Output() valueChange = new EventEmitter<OrderStatusFilter>();

  readonly statuses: OrderStatusFilter[] = ['all', 'open', 'shipped'];
}
