export type OrderStatusFilter = 'all' | 'open' | 'shipped';

export interface IRemoteConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}

export interface INotesRemote {
  defineElements(config: IRemoteConfig): Promise<void>;
}

export interface IStatusChangeDetail {
  status: OrderStatusFilter;
}

export interface INoteAddedDetail {
  orderId: string;
  text: string;
}

export interface IStatusFilterContract {
  tagName: 'shop-status-filter';
  attributes: {
    value: OrderStatusFilter;
  };
  properties: {
    value: OrderStatusFilter;
  };
  events: {
    statusChange: IStatusChangeDetail;
  };
}

export interface IOrderNotesContract {
  tagName: 'shop-order-notes';
  attributes: {
    'order-id': string;
  };
  properties: {
    orderId: string;
  };
  events: {
    noteAdded: INoteAddedDetail;
  };
}

export type NotesContracts = IStatusFilterContract | IOrderNotesContract;
