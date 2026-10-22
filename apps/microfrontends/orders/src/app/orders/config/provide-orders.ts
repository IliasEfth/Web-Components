import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import type { IRemoteConfig } from '@shop/orders-contract';
import { OrdersClient } from '../clients/orders-client';
import { OrdersService } from '../services/orders-service';
import { ORDERS_CONFIG } from './orders-config';

export function provideOrders(config: IRemoteConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ORDERS_CONFIG, useValue: config },
    OrdersClient,
    OrdersService,
  ]);
}
