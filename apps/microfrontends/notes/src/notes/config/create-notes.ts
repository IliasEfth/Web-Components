import type { IRemoteConfig } from '@shop/notes-contract';
import type { InjectionKey, Plugin } from 'vue';
import { NotesClient } from '../clients/notes-client';
import { NotesService } from '../services/notes-service';

export const notesServiceKey: InjectionKey<NotesService> = Symbol('NotesService');

export function createNotes(config: IRemoteConfig): Plugin {
  const notesService = new NotesService(new NotesClient(config));
  return {
    install(app) {
      app.provide(notesServiceKey, notesService);
    },
  };
}
