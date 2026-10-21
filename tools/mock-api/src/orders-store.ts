import { readFile, writeFile } from 'node:fs/promises';
import type { INote } from './note.ts';
import type { IOrder, OrderStatus, OrderStatusFilter } from './order.ts';

interface IDatabaseContent {
  orders: IOrder[];
  notes: INote[];
}

export class OrdersStore {
  readonly #file: URL;
  #orders: IOrder[];
  #notes: INote[];

  private constructor(file: URL, content: IDatabaseContent) {
    this.#file = file;
    this.#orders = content.orders;
    this.#notes = content.notes;
  }

  static async open(file: URL): Promise<OrdersStore> {
    const content = JSON.parse(await readFile(file, 'utf8')) as IDatabaseContent;
    return new OrdersStore(file, content);
  }

  list(filter: OrderStatusFilter): IOrder[] {
    return filter === 'all'
      ? this.#orders
      : this.#orders.filter((order) => order.status === filter);
  }

  find(id: string): IOrder | undefined {
    return this.#orders.find((order) => order.id === id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<IOrder | undefined> {
    const order = this.find(id);
    if (!order) {
      return undefined;
    }

    const updated: IOrder = { ...order, status };
    this.#orders = this.#orders.map((existing) => (existing.id === id ? updated : existing));
    await this.#save();
    return updated;
  }

  listNotes(orderId: string): INote[] {
    return this.#notes.filter((note) => note.orderId === orderId);
  }

  async addNote(orderId: string, text: string): Promise<INote> {
    const note: INote = {
      id: Math.max(0, ...this.#notes.map((existing) => existing.id)) + 1,
      orderId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    this.#notes = [...this.#notes, note];
    await this.#save();
    return note;
  }

  async #save(): Promise<void> {
    const content: IDatabaseContent = { orders: this.#orders, notes: this.#notes };
    await writeFile(this.#file, `${JSON.stringify(content, null, 2)}\n`);
  }
}
