import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import type { IListOrdersParams, IOrder, IOrdersApi } from '@shop/api-contract';
import type { IRemoteConfig } from '@shop/orders-contract';
import { Observable } from 'rxjs';
import { REMOTE_CONFIG } from '../models/remote-config';
import { ObservableApi } from './observable-api';

@Injectable({ providedIn: 'root' })
export class OrdersClientService implements ObservableApi<Pick<IOrdersApi, 'listOrders'>> {
  constructor(
    private readonly http: HttpClient,
    @Inject(REMOTE_CONFIG) private readonly config: IRemoteConfig,
  ) {}

  listOrders(params: IListOrdersParams = {}): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.config.apiBase}/orders`, {
      params: params.status ? { status: params.status } : {},
    });
  }
}
