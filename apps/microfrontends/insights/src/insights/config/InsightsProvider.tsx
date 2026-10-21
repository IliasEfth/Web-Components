import { type ReactNode, useMemo } from 'react';
import { OrdersClient } from '../clients/orders-client';
import { OrderStatsService } from '../services/order-stats-service';
import type { IInsightsConfig } from './insights-config';
import { OrderStatsServiceContext } from './order-stats-service-context';

interface IInsightsProviderProps {
  config: IInsightsConfig;
  children: ReactNode;
}

export function InsightsProvider({ config, children }: IInsightsProviderProps) {
  const orderStatsService = useMemo(
    () => new OrderStatsService(new OrdersClient(config)),
    [config],
  );

  return <OrderStatsServiceContext value={orderStatsService}>{children}</OrderStatsServiceContext>;
}
