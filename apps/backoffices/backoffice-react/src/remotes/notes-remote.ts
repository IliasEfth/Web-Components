import { remoteConfig } from '../app-config';

let notesReady: Promise<void> | undefined;

export function loadNotesElements(): Promise<void> {
  notesReady ??= import('notes/elements')
    .then(({ defineElements }) => defineElements(remoteConfig))
    .catch((error: unknown) => {
      notesReady = undefined;
      throw error;
    });
  return notesReady;
}
