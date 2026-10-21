import { Component } from '@angular/core';
import { EMPTY, Observable, catchError, map } from 'rxjs';
import { IOrder } from '../models/order';
import { OrdersClientService } from '../services/orders-client.service';

interface IDashboard {
  openOrders: IOrder[];
  shippedCount: number;
  revenue: number;
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  readonly dashboard$: Observable<IDashboard>;
  loadFailed = false;

  constructor(ordersClient: OrdersClientService) {
    this.dashboard$ = ordersClient.list().pipe(
      map((orders) => {
        const openOrders = orders.filter((order) => order.status === 'open');
        return {
          openOrders,
          shippedCount: orders.length - openOrders.length,
          revenue: orders.reduce((sum, order) => sum + order.total, 0),
        };
      }),
      catchError(() => {
        this.loadFailed = true;
        return EMPTY;
      }),
    );
  }
}
