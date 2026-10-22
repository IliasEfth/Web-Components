export type OrderStatusFilter = 'all' | 'open' | 'shipped';

export interface IInsightsRemote {
  defineElements(): Promise<void>;
}

export interface IActivityEntry {
  id: number;
  at: string;
  text: string;
}

export interface IStatusPickedDetail {
  status: OrderStatusFilter;
}

export type ClearedDetail = Record<string, never>;

export interface IOrderStatsContract {
  tagName: 'shop-order-stats';
  attributes: {
    'refresh-key': string;
  };
  properties: {
    refreshKey: string;
  };
  events: {
    statusPicked: IStatusPickedDetail;
  };
}

export interface IActivityFeedContract {
  tagName: 'shop-activity-feed';
  attributes: Record<never, never>;
  properties: {
    entries: IActivityEntry[];
  };
  events: {
    cleared: ClearedDetail;
  };
}

export type InsightsContracts = IOrderStatsContract | IActivityFeedContract;
