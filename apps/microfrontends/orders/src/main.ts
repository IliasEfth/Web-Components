import { initFederation } from '@angular-architects/native-federation';

initFederation({}, { hostRemoteEntry: { url: './remoteEntry.json' }, shimMode: false })
  .catch((error: unknown) => console.error(error))
  .then(() => import('./bootstrap'))
  .catch((error: unknown) => console.error(error));
