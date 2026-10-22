import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { OrderStatusFilter } from '@shop/api-contract';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
})
export class StatusFilterComponent {
  @Input() value: OrderStatusFilter = 'all';
  @Output() valueChange = new EventEmitter<OrderStatusFilter>();

  readonly statuses: OrderStatusFilter[] = ['all', 'open', 'shipped'];
}
