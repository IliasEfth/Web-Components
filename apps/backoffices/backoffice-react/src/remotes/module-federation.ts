import { createInstance } from '@module-federation/runtime';
import { remoteEntries } from '../remote-entries';

export const moduleFederation = createInstance({
  name: 'backoffice',
  remotes: [
    { name: 'insights', entry: remoteEntries.insights, type: 'module' },
    { name: 'notes', entry: remoteEntries.notes, type: 'module' },
  ],
  shared: {},
  shareStrategy: 'loaded-first',
});
