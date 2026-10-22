import { InjectionToken } from '@angular/core';

export interface IOrdersConfig {
  apiBase: string;
}

export const ordersConfig: IOrdersConfig = { apiBase: '/api' };

export const ORDERS_CONFIG = new InjectionToken<IOrdersConfig>('ORDERS_CONFIG');
