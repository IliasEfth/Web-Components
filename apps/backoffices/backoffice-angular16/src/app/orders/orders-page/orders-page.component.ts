import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { IActivityEntry } from '../../models/activity-entry';
import {
  INoteAddedDetail,
  IOrderClosedDetail,
  IOrderSelectedDetail,
  IOrderUpdatedDetail,
  IStatusChangeDetail,
  IStatusPickedDetail,
} from '../../models/element-events';
import { OrderStatusFilter } from '../../models/order';
import { RemoteElementsService } from '../../services/remote-elements.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
  readonly orderId$: Observable<string | null>;
  readonly loadOrders = () => this.remoteElements.loadOrders();
  readonly loadInsights = () => this.remoteElements.loadInsights();
  readonly loadNotes = () => this.remoteElements.loadNotes();

  status: OrderStatusFilter = 'all';
  refreshCount = 0;
  entries: IActivityEntry[] = [];
  private nextEntryId = 1;

  constructor(
    route: ActivatedRoute,
    private readonly router: Router,
    private readonly remoteElements: RemoteElementsService,
  ) {
    this.orderId$ = route.paramMap.pipe(map((params) => params.get('orderId')));
  }

  statusChanged(event: Event): void {
    const { status } = (event as CustomEvent<IStatusChangeDetail>).detail;
    this.status = status;
    this.log(`statusChange { status: ${status} }`);
  }

  statusPicked(event: Event): void {
    const { status } = (event as CustomEvent<IStatusPickedDetail>).detail;
    this.status = status;
    this.log(`statusPicked { status: ${status} }`);
  }

  orderSelected(event: Event): void {
    const { id } = (event as CustomEvent<IOrderSelectedDetail>).detail;
    this.log(`orderSelected { id: ${id} }`);
    this.router.navigate(['/orders', id]);
  }

  orderUpdated(event: Event): void {
    const { id, status } = (event as CustomEvent<IOrderUpdatedDetail>).detail;
    this.log(`orderUpdated { id: ${id}, status: ${status} }`);
    this.refreshCount++;
  }

  orderClosed(event: Event): void {
    const { id } = (event as CustomEvent<IOrderClosedDetail>).detail;
    this.log(`closed { id: ${id} }`);
    this.router.navigate(['/orders']);
  }

  noteAdded(event: Event): void {
    const { orderId, text } = (event as CustomEvent<INoteAddedDetail>).detail;
    this.log(`noteAdded { orderId: ${orderId}, text: ${text} }`);
  }

  clearActivity(): void {
    this.entries = [];
  }

  private log(text: string): void {
    const entry: IActivityEntry = {
      id: this.nextEntryId++,
      at: new Date().toLocaleTimeString(),
      text,
    };
    this.entries = [entry, ...this.entries];
  }
}
