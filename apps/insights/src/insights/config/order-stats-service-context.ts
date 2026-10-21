import { createContext } from 'react';
import type { OrderStatsService } from '../services/order-stats-service';

export const OrderStatsServiceContext = createContext<OrderStatsService | null>(null);
