import { provideHttpClient } from '@angular/common/http';
import {
  type Injector,
  type OutputEmitterRef,
  type Type,
  provideZonelessChangeDetection,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import type {
  IOrderDetailContract,
  IOrdersListContract,
  IOrdersRemote,
  IRemoteConfig,
  OrdersContracts,
} from '@shop/orders-contract';
import { OrderDetail } from './orders/components/order-detail/order-detail';
import { OrdersList } from './orders/components/orders-list/orders-list';
import { provideOrders } from './orders/config/provide-orders';

type ComponentImplementing<TContract extends OrdersContracts> = {
  [K in keyof TContract['properties']]: () => TContract['properties'][K];
} & {
  [K in keyof TContract['events']]: OutputEmitterRef<TContract['events'][K]>;
};

let elementsDefined: Promise<void> | undefined;

export const defineElements: IOrdersRemote['defineElements'] = (config) => {
  elementsDefined ??= registerElements(config);
  return elementsDefined;
};

async function registerElements(config: IRemoteConfig): Promise<void> {
  const application = await createApplication({
    providers: [provideZonelessChangeDetection(), provideHttpClient(), provideOrders(config)],
  });

  defineElement<IOrdersListContract>('shop-orders-list', OrdersList, application.injector);
  defineElement<IOrderDetailContract>('shop-order-detail', OrderDetail, application.injector);
}

function defineElement<TContract extends OrdersContracts>(
  tagName: TContract['tagName'],
  component: Type<ComponentImplementing<TContract>>,
  injector: Injector,
): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, createCustomElement(component, { injector }));
  }
}
