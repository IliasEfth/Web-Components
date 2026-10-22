import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { OrdersClient } from '../clients/orders-client';
import { OrdersService } from '../services/orders-service';
import { ORDERS_CONFIG, ordersConfig } from './orders-config';

export function provideOrders(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ORDERS_CONFIG, useValue: ordersConfig },
    OrdersClient,
    OrdersService,
  ]);
}
