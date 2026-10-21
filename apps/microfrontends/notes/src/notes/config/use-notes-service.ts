import { inject } from 'vue';
import type { NotesService } from '../services/notes-service';
import { notesServiceKey } from './create-notes';

export function useNotesService(): NotesService {
  const notesService = inject(notesServiceKey);
  if (!notesService) {
    throw new Error('useNotesService needs app.use(createNotes(config))');
  }
  return notesService;
}
