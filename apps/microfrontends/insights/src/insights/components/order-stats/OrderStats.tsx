import type { IOrderStatsContract } from '@shop/insights-contract';
import { useEffect, useState } from 'react';
import { useOrderStatsService } from '../../config/useOrderStatsService';
import type { ComponentProps } from '../../models/component-props';
import type { IOrderStats } from '../../models/order-stats';
import './order-stats.css';

type OrderStatsProps = ComponentProps<IOrderStatsContract>;

const euros = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

export function OrderStats({ refreshKey, onStatusPicked }: OrderStatsProps) {
  const orderStatsService = useOrderStatsService();
  const [stats, setStats] = useState<IOrderStats | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    orderStatsService
      .getStats(controller.signal)
      .then((loaded) => {
        setStats(loaded);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadFailed(true);
        }
      });
    return () => controller.abort();
  }, [orderStatsService, refreshKey]);

  if (loadFailed) {
    return <p className="order-stats__message order-stats__message--error">Could not load the statistics.</p>;
  }
  if (!stats) {
    return <p className="order-stats__message">Loading statistics…</p>;
  }

  return (
    <section className="order-stats">
      <button type="button" className="order-stats__tile" onClick={() => onStatusPicked?.({ status: 'open' })}>
        <span className="order-stats__value">{stats.open}</span>
        <span className="order-stats__label">Open orders</span>
      </button>
      <button type="button" className="order-stats__tile" onClick={() => onStatusPicked?.({ status: 'shipped' })}>
        <span className="order-stats__value">{stats.shipped}</span>
        <span className="order-stats__label">Shipped</span>
      </button>
      <button type="button" className="order-stats__tile" onClick={() => onStatusPicked?.({ status: 'all' })}>
        <span className="order-stats__value">{euros.format(stats.revenue)}</span>
        <span className="order-stats__label">Revenue, all orders</span>
      </button>
    </section>
  );
}
