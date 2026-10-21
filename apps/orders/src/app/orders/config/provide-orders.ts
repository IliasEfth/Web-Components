import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { OrdersClient } from '../clients/orders-client';
import { OrdersService } from '../services/orders-service';
import { ORDERS_CONFIG, type IOrdersConfig } from './orders-config';

export function provideOrders(config: IOrdersConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ORDERS_CONFIG, useValue: config },
    OrdersClient,
    OrdersService,
  ]);
}
