import { Inject, Injectable } from '@angular/core';
import { createInstance } from '@module-federation/runtime';
import { initFederation } from '@softarc/native-federation-orchestrator';
import { useDefaultImportMap } from '@softarc/native-federation-orchestrator/options';
import { IRemoteConfig, IRemoteElements, REMOTE_CONFIG } from '../models/remote-config';
import { remoteEntries } from '../remote-entries';

@Injectable({ providedIn: 'root' })
export class RemoteElementsService {
  private readonly moduleFederation = createInstance({
    name: 'backoffice_angular16',
    remotes: [
      { name: 'insights', entry: remoteEntries.insights, type: 'module' },
      { name: 'notes', entry: remoteEntries.notes, type: 'module' },
    ],
    shared: {},
    shareStrategy: 'loaded-first',
  });

  private readonly loading = new Map<string, Promise<void>>();

  constructor(@Inject(REMOTE_CONFIG) private readonly config: IRemoteConfig) {}

  loadOrders(): Promise<void> {
    return this.loadOnce('orders', async () => {
      const nativeFederation = await initFederation(
        { orders: remoteEntries.orders },
        {
          ...useDefaultImportMap(),
          loadModuleFn: (url: string) => import(/* webpackIgnore: true */ url),
        },
      );
      return nativeFederation.loadRemoteModule<IRemoteElements>('orders', './elements');
    });
  }

  loadInsights(): Promise<void> {
    return this.loadOnce('insights', () =>
      this.moduleFederation.loadRemote<IRemoteElements>('insights/elements'),
    );
  }

  loadNotes(): Promise<void> {
    return this.loadOnce('notes', () =>
      this.moduleFederation.loadRemote<IRemoteElements>('notes/elements'),
    );
  }

  private loadOnce(
    remoteName: string,
    importElements: () => Promise<IRemoteElements | null>,
  ): Promise<void> {
    let ready = this.loading.get(remoteName);
    if (!ready) {
      ready = importElements().then((elements) => {
        if (!elements) {
          throw new Error(`${remoteName} exposes no elements`);
        }
        return elements.defineElements(this.config);
      });
      ready.catch(() => this.loading.delete(remoteName));
      this.loading.set(remoteName, ready);
    }
    return ready;
  }
}
