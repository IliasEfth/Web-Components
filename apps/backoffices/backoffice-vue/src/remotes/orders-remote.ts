import type { IOrdersRemote } from '@shop/orders-contract';
import { initFederation } from '@softarc/native-federation-orchestrator';
import { remoteEntries } from '../remote-entries';

let ordersReady: Promise<void> | undefined;

export function loadOrdersElements(): Promise<void> {
  ordersReady ??= initFederation({ orders: remoteEntries.orders })
    .then(({ loadRemoteModule }) => loadRemoteModule<IOrdersRemote>('orders', './elements'))
    .then(({ defineElements }) => defineElements())
    .catch((error: unknown) => {
      ordersReady = undefined;
      throw error;
    });
  return ordersReady;
}
