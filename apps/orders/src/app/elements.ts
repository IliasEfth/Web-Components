import { provideHttpClient } from '@angular/common/http';
import { type Injector, type Type, provideZonelessChangeDetection } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { OrderDetail } from './orders/components/order-detail/order-detail';
import { OrdersList } from './orders/components/orders-list/orders-list';
import type { IOrdersConfig } from './orders/config/orders-config';
import { provideOrders } from './orders/config/provide-orders';

let elementsDefined: Promise<void> | undefined;

export function defineElements(config: IOrdersConfig): Promise<void> {
  elementsDefined ??= registerElements(config);
  return elementsDefined;
}

async function registerElements(config: IOrdersConfig): Promise<void> {
  const application = await createApplication({
    providers: [provideZonelessChangeDetection(), provideHttpClient(), provideOrders(config)],
  });

  defineElement('shop-orders-list', OrdersList, application.injector);
  defineElement('shop-order-detail', OrderDetail, application.injector);
}

function defineElement(tagName: string, component: Type<unknown>, injector: Injector): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, createCustomElement(component, { injector }));
  }
}
