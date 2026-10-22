import { InjectionToken } from '@angular/core';

export interface IOrdersConfig {
  apiBase: string;
}

export const ordersConfig: IOrdersConfig = { apiBase: 'http://localhost:3000' };

export const ORDERS_CONFIG = new InjectionToken<IOrdersConfig>('ORDERS_CONFIG');
