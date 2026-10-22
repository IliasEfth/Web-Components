import type { IRemoteConfig } from '@shop/insights-contract';
import { type ReactNode, useMemo } from 'react';
import { OrdersClient } from '../clients/orders-client';
import { OrderStatsService } from '../services/order-stats-service';
import { OrderStatsServiceContext } from './order-stats-service-context';

interface IInsightsProviderProps {
  config: IRemoteConfig;
  children: ReactNode;
}

export function InsightsProvider({ config, children }: IInsightsProviderProps) {
  const orderStatsService = useMemo(
    () => new OrderStatsService(new OrdersClient(config)),
    [config],
  );

  return <OrderStatsServiceContext value={orderStatsService}>{children}</OrderStatsServiceContext>;
}
