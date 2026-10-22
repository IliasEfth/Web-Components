import type { IAddOrderNoteParams, INote, IOrderParams, IOrdersApi } from '@shop/api-contract';
import type { INotesConfig } from '../config/notes-config';

export class NotesClient implements Pick<IOrdersApi, 'listOrderNotes' | 'addOrderNote'> {
  readonly #config: INotesConfig;

  constructor(config: INotesConfig) {
    this.#config = config;
  }

  async listOrderNotes({ id }: IOrderParams, signal?: AbortSignal): Promise<INote[]> {
    const response = await fetch(this.#notesUrl(id), { signal });
    if (!response.ok) {
      throw new Error(`GET /orders/${id}/notes failed with ${response.status}`);
    }
    return (await response.json()) as INote[];
  }

  async addOrderNote({ id, text }: IAddOrderNoteParams): Promise<INote> {
    const response = await fetch(this.#notesUrl(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error(`POST /orders/${id}/notes failed with ${response.status}`);
    }
    return (await response.json()) as INote;
  }

  #notesUrl(orderId: string): string {
    return `${this.#config.apiBase}/orders/${encodeURIComponent(orderId)}/notes`;
  }
}
