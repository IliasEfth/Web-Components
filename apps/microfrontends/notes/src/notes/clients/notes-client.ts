import type { IAddOrderNoteParams, INote, IOrderParams, IOrdersApi } from '@shop/api-contract';
import type { IRemoteConfig } from '@shop/notes-contract';

export class NotesClient implements Pick<IOrdersApi, 'listOrderNotes' | 'addOrderNote'> {
  readonly #config: IRemoteConfig;

  constructor(config: IRemoteConfig) {
    this.#config = config;
  }

  async listOrderNotes({ id }: IOrderParams, signal?: AbortSignal): Promise<INote[]> {
    const response = await fetch(this.#notesUrl(id), { headers: this.#headers(), signal });
    if (!response.ok) {
      throw new Error(`GET /orders/${id}/notes failed with ${response.status}`);
    }
    return (await response.json()) as INote[];
  }

  async addOrderNote({ id, text }: IAddOrderNoteParams): Promise<INote> {
    const response = await fetch(this.#notesUrl(id), {
      method: 'POST',
      headers: { ...this.#headers(), 'Content-Type': 'application/json' },
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

  #headers(): Record<string, string> {
    const authToken = this.#config.getAuthToken?.();
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }
}
