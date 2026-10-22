export type OrderStatus = 'open' | 'shipped';

export type OrderStatusFilter = OrderStatus | 'all';

export interface IOrder {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  /** ISO date, for example `2026-10-12`. */
  createdAt: string;
}

export interface INote {
  id: number;
  orderId: string;
  text: string;
  /** ISO date and time, for example `2026-10-12T09:30:00.000Z`. */
  createdAt: string;
}

/** The body of every 400 and 404 response. */
export interface IApiError {
  error: string;
}

export interface IListOrdersParams {
  /** `all` (the default), `open` or `shipped`. */
  status?: OrderStatusFilter;
}

export interface IOrderParams {
  /** The order id, for example `A-1001`. */
  id: string;
}

export interface IUpdateOrderStatusParams {
  id: string;
  /** The new status. Only the status of an order can change. */
  status: OrderStatus;
}

export interface IAddOrderNoteParams {
  id: string;
  /** 1 to 500 characters. */
  text: string;
}

/**
 * The Shop Back Office API, as described in openapi.yaml. A client implements the methods it
 * calls, for example `class OrdersClient implements Pick<IOrdersApi, 'listOrders'>`.
 * Every request accepts an optional `Authorization: Bearer <token>` header.
 */
export interface IOrdersApi {
  /**
   * `GET /orders?status={status}`: the orders, all of them or filtered by status.
   * 400 when `status` is not `all`, `open` or `shipped`.
   */
  listOrders(params?: IListOrdersParams): Promise<IOrder[]>;

  /**
   * `GET /orders/{id}`: one order.
   * 404 when the order does not exist.
   */
  getOrder(params: IOrderParams): Promise<IOrder>;

  /**
   * `PATCH /orders/{id}` with body `{ status }`: changes the status and returns the updated order.
   * 400 for an unknown status, 404 when the order does not exist.
   */
  updateOrderStatus(params: IUpdateOrderStatusParams): Promise<IOrder>;

  /**
   * `GET /orders/{id}/notes`: the notes of one order, oldest first.
   * 404 when the order does not exist.
   */
  listOrderNotes(params: IOrderParams): Promise<INote[]>;

  /**
   * `POST /orders/{id}/notes` with body `{ text }`: adds a note and returns it (201).
   * 400 when the text is empty or longer than 500 characters, 404 when the order does not exist.
   */
  addOrderNote(params: IAddOrderNoteParams): Promise<INote>;
}
