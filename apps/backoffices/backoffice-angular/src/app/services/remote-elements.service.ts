import { Injectable } from '@angular/core';
import { createInstance } from '@module-federation/runtime';
import type { IInsightsRemote } from '@shop/insights-contract';
import type { INotesRemote } from '@shop/notes-contract';
import type { IOrdersRemote } from '@shop/orders-contract';
import { initFederation } from '@softarc/native-federation-orchestrator';
import { remoteEntries } from '../remote-entries';

@Injectable({ providedIn: 'root' })
export class RemoteElementsService {
  private readonly moduleFederation = createInstance({
    name: 'backoffice_angular',
    remotes: [
      { name: 'insights', entry: remoteEntries.insights, type: 'module' },
      { name: 'notes', entry: remoteEntries.notes, type: 'module' },
    ],
    shared: {},
    shareStrategy: 'loaded-first',
  });

  private readonly loading = new Map<string, Promise<void>>();

  loadOrders(): Promise<void> {
    return this.loadOnce('orders', async () => {
      const nativeFederation = await initFederation({ orders: remoteEntries.orders });
      return nativeFederation.loadRemoteModule<IOrdersRemote>('orders', './elements');
    });
  }

  loadInsights(): Promise<void> {
    return this.loadOnce('insights', () =>
      this.moduleFederation.loadRemote<IInsightsRemote>('insights/elements'),
    );
  }

  loadNotes(): Promise<void> {
    return this.loadOnce('notes', () =>
      this.moduleFederation.loadRemote<INotesRemote>('notes/elements'),
    );
  }

  private loadOnce(
    remoteName: string,
    importElements: () => Promise<IOrdersRemote | IInsightsRemote | INotesRemote | null>,
  ): Promise<void> {
    let ready = this.loading.get(remoteName);
    if (!ready) {
      ready = importElements().then((elements) => {
        if (!elements) {
          throw new Error(`${remoteName} exposes no elements`);
        }
        return elements.defineElements();
      });
      ready.catch(() => this.loading.delete(remoteName));
      this.loading.set(remoteName, ready);
    }
    return ready;
  }
}
