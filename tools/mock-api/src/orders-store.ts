import { readFile, writeFile } from 'node:fs/promises';
import type { Order, OrderStatus, OrderStatusFilter } from './order.ts';

interface DatabaseContent {
  orders: Order[];
}

export class OrdersStore {
  readonly #file: URL;
  #orders: Order[];

  private constructor(file: URL, orders: Order[]) {
    this.#file = file;
    this.#orders = orders;
  }

  static async open(file: URL): Promise<OrdersStore> {
    const content = JSON.parse(await readFile(file, 'utf8')) as DatabaseContent;
    return new OrdersStore(file, content.orders);
  }

  list(filter: OrderStatusFilter): Order[] {
    return filter === 'all'
      ? this.#orders
      : this.#orders.filter((order) => order.status === filter);
  }

  find(id: string): Order | undefined {
    return this.#orders.find((order) => order.id === id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const order = this.find(id);
    if (!order) {
      return undefined;
    }

    const updated: Order = { ...order, status };
    this.#orders = this.#orders.map((existing) => (existing.id === id ? updated : existing));
    await this.#save();
    return updated;
  }

  async #save(): Promise<void> {
    const content: DatabaseContent = { orders: this.#orders };
    await writeFile(this.#file, `${JSON.stringify(content, null, 2)}\n`);
  }
}
