import type { InjectionKey, Plugin } from 'vue';
import { NotesClient } from '../clients/notes-client';
import { NotesService } from '../services/notes-service';
import type { INotesConfig } from './notes-config';

export const notesServiceKey: InjectionKey<NotesService> = Symbol('NotesService');

export function createNotes(config: INotesConfig): Plugin {
  const notesService = new NotesService(new NotesClient(config));
  return {
    install(app) {
      app.provide(notesServiceKey, notesService);
    },
  };
}
