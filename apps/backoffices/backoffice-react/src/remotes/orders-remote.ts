import { initFederation } from '@softarc/native-federation-orchestrator';
import { remoteConfig } from '../app-config';
import type { IRemoteElements } from '../models/remote-config';
import { remoteEntries } from '../remote-entries';

let ordersReady: Promise<void> | undefined;

export function loadOrdersElements(): Promise<void> {
  ordersReady ??= initFederation({ orders: remoteEntries.orders })
    .then(({ loadRemoteModule }) => loadRemoteModule<IRemoteElements>('orders', './elements'))
    .then(({ defineElements }) => defineElements(remoteConfig))
    .catch((error: unknown) => {
      ordersReady = undefined;
      throw error;
    });
  return ordersReady;
}
