import type { INotesRemote } from '@shop/notes-contract';
import { moduleFederation } from './module-federation';

let notesReady: Promise<void> | undefined;

export function loadNotesElements(): Promise<void> {
  notesReady ??= moduleFederation
    .loadRemote<INotesRemote>('notes/elements')
    .then((elements) => {
      if (!elements) {
        throw new Error('notes exposes no elements');
      }
      return elements.defineElements();
    })
    .catch((error: unknown) => {
      notesReady = undefined;
      throw error;
    });
  return notesReady;
}
