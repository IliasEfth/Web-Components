import { provideHttpClient } from '@angular/common/http';
import {
  type ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import type { IRemoteConfig } from '@shop/orders-contract';
import { routes } from './app.routes';
import { defineElements } from './elements';
import { provideOrders } from './orders/config/provide-orders';

const ordersConfig: IRemoteConfig = { apiBase: 'http://localhost:3000' };

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideOrders(ordersConfig),
    provideAppInitializer(() => defineElements(ordersConfig)),
  ],
};
