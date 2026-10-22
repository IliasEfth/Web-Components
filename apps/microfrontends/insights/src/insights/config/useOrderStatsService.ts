import { useContext } from 'react';
import type { OrderStatsService } from '../services/order-stats-service';
import { OrderStatsServiceContext } from './order-stats-service-context';

export function useOrderStatsService(): OrderStatsService {
  const orderStatsService = useContext(OrderStatsServiceContext);
  if (!orderStatsService) {
    throw new Error('useOrderStatsService needs an <InsightsProvider> above it');
  }
  return orderStatsService;
}
