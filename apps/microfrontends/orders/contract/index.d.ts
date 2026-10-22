export type OrderStatus = 'open' | 'shipped';

export type OrderStatusFilter = OrderStatus | 'all';

export interface IOrdersRemote {
  defineElements(): Promise<void>;
}

export interface IOrderSelectedDetail {
  id: string;
}

export interface IOrderUpdatedDetail {
  id: string;
  status: OrderStatus;
}

export interface IOrderClosedDetail {
  id: string;
}

export interface IOrdersListContract {
  tagName: 'shop-orders-list';
  attributes: {
    status: OrderStatusFilter;
    'page-size': string;
  };
  properties: {
    status: OrderStatusFilter;
    pageSize: number;
  };
  events: {
    orderSelected: IOrderSelectedDetail;
  };
}

export interface IOrderDetailContract {
  tagName: 'shop-order-detail';
  attributes: {
    'order-id': string;
  };
  properties: {
    orderId: string | null;
  };
  events: {
    orderUpdated: IOrderUpdatedDetail;
    closed: IOrderClosedDetail;
  };
}

export type OrdersContracts = IOrdersListContract | IOrderDetailContract;
