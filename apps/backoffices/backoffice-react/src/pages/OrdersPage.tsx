import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { StatusFilter } from '../components/StatusFilter';
import type { OrderStatusFilter } from '../models/order';
import { loadInsightsElements } from '../remotes/insights-remote';
import { loadOrdersElements } from '../remotes/orders-remote';
import { RemoteGate } from '../remotes/RemoteGate';
import { useActivityLog } from '../shared/useActivityLog';

export function OrdersPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatusFilter>('all');
  const [refreshCount, setRefreshCount] = useState(0);
  const { entries, log, clear } = useActivityLog();

  const changeStatus = (next: OrderStatusFilter, source: string) => {
    setStatus(next);
    log(`${source}: status ${next}`);
  };

  return (
    <>
      <p className="intro">
        React owns the URL, the filter and the layout. The list and the detail are Angular, the
        statistics and the feed are React from another server. They meet only in this page.
      </p>

      <StatusFilter value={status} onChange={(next) => changeStatus(next, 'React filter')} />

      <div className="layout">
        <RemoteGate name="Orders" load={loadOrdersElements}>
          <div className="stack">
            <shop-orders-list
              status={status}
              page-size="10"
              onorderSelected={(event) => {
                log(`orderSelected { id: ${event.detail.id} }`);
                navigate(`/orders/${event.detail.id}`);
              }}
            />
            <shop-order-detail
              order-id={orderId}
              onorderUpdated={(event) => {
                log(`orderUpdated { id: ${event.detail.id}, status: ${event.detail.status} }`);
                setRefreshCount((count) => count + 1);
              }}
              onclosed={(event) => {
                log(`closed { id: ${event.detail.id} }`);
                navigate('/orders');
              }}
            />
          </div>
        </RemoteGate>

        <RemoteGate name="Insights" load={loadInsightsElements}>
          <div className="stack">
            <shop-order-stats
              refresh-key={String(refreshCount)}
              onstatusPicked={(event) => changeStatus(event.detail.status, 'statusPicked')}
            />
            <shop-activity-feed entries={entries} oncleared={clear} />
          </div>
        </RemoteGate>
      </div>
    </>
  );
}
