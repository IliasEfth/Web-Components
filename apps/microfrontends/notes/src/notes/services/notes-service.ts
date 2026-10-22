import type { INote } from '@shop/api-contract';
import type { NotesClient } from '../clients/notes-client';

export class NotesService {
  readonly #client: NotesClient;

  constructor(client: NotesClient) {
    this.#client = client;
  }

  list(orderId: string, signal?: AbortSignal): Promise<INote[]> {
    return this.#client.listOrderNotes({ id: orderId }, signal);
  }

  add(orderId: string, text: string): Promise<INote> {
    return this.#client.addOrderNote({ id: orderId, text: text.trim() });
  }
}
