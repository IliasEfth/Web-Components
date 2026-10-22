import { Component } from '@angular/core';
import { Router } from '@angular/router';
import type { IOrderSelectedDetail } from '@shop/orders-contract';
import { RemoteElementsService } from '../services/remote-elements.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  standalone: false,
})
export class DashboardPageComponent {
  readonly loadOrders = () => this.remoteElements.loadOrders();
  readonly loadInsights = () => this.remoteElements.loadInsights();

  constructor(
    private readonly router: Router,
    private readonly remoteElements: RemoteElementsService,
  ) {}

  orderSelected(event: Event): void {
    const { id } = (event as CustomEvent<IOrderSelectedDetail>).detail;
    this.router.navigate(['/orders', id]);
  }
}
