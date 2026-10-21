import type { INotesConfig } from '../config/notes-config';
import type { INote } from '../models/note';

export class NotesClient {
  readonly #config: INotesConfig;

  constructor(config: INotesConfig) {
    this.#config = config;
  }

  async listNotes(orderId: string, signal?: AbortSignal): Promise<INote[]> {
    const response = await fetch(this.#notesUrl(orderId), { headers: this.#headers(), signal });
    if (!response.ok) {
      throw new Error(`GET /orders/${orderId}/notes failed with ${response.status}`);
    }
    return (await response.json()) as INote[];
  }

  async addNote(orderId: string, text: string): Promise<INote> {
    const response = await fetch(this.#notesUrl(orderId), {
      method: 'POST',
      headers: { ...this.#headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error(`POST /orders/${orderId}/notes failed with ${response.status}`);
    }
    return (await response.json()) as INote;
  }

  #notesUrl(orderId: string): string {
    return `${this.#config.apiBase}/orders/${encodeURIComponent(orderId)}/notes`;
  }

  #headers(): Record<string, string> {
    const authToken = this.#config.getAuthToken?.();
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }
}
