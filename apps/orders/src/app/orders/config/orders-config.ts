import { InjectionToken } from '@angular/core';

export interface IOrdersConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}

export const ORDERS_CONFIG = new InjectionToken<IOrdersConfig>('ORDERS_CONFIG');
