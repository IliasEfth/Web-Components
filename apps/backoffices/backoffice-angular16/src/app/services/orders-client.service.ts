import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IOrder } from '../models/order';
import { IRemoteConfig, REMOTE_CONFIG } from '../models/remote-config';

@Injectable({ providedIn: 'root' })
export class OrdersClientService {
  constructor(
    private readonly http: HttpClient,
    @Inject(REMOTE_CONFIG) private readonly config: IRemoteConfig,
  ) {}

  list(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.config.apiBase}/orders`);
  }
}
