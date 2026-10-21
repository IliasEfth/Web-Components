import type { NotesClient } from '../clients/notes-client';
import type { INote } from '../models/note';

export class NotesService {
  readonly #client: NotesClient;

  constructor(client: NotesClient) {
    this.#client = client;
  }

  list(orderId: string, signal?: AbortSignal): Promise<INote[]> {
    return this.#client.listNotes(orderId, signal);
  }

  add(orderId: string, text: string): Promise<INote> {
    return this.#client.addNote(orderId, text.trim());
  }
}
