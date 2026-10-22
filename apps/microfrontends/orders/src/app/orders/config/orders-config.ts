import { InjectionToken } from '@angular/core';
import type { IRemoteConfig } from '@shop/orders-contract';

export const ORDERS_CONFIG = new InjectionToken<IRemoteConfig>('ORDERS_CONFIG');
