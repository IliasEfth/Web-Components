export interface IRemoteConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}

export interface INotesRemote {
  defineElements(config: IRemoteConfig): Promise<void>;
}

export interface INoteAddedDetail {
  orderId: string;
  text: string;
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

export type NotesContracts = IOrderNotesContract;
