import { readFile, writeFile } from 'node:fs/promises';
import type { IOrder, OrderStatus, OrderStatusFilter } from './order.ts';

interface IDatabaseContent {
  orders: IOrder[];
}

export class OrdersStore {
  readonly #file: URL;
  #orders: IOrder[];

  private constructor(file: URL, orders: IOrder[]) {
    this.#file = file;
    this.#orders = orders;
  }

  static async open(file: URL): Promise<OrdersStore> {
    const content = JSON.parse(await readFile(file, 'utf8')) as IDatabaseContent;
    return new OrdersStore(file, content.orders);
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

  async #save(): Promise<void> {
    const content: IDatabaseContent = { orders: this.#orders };
    await writeFile(this.#file, `${JSON.stringify(content, null, 2)}\n`);
  }
}
