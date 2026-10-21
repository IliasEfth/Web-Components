import { useState } from 'react';
import { ActivityFeed } from '../insights/components/activity-feed/ActivityFeed';
import { OrderStats } from '../insights/components/order-stats/OrderStats';
import { useActivityLog } from '../shared/useActivityLog';

export function ComponentsPage() {
  const [refreshCount, setRefreshCount] = useState(0);
  const { entries, log, clear } = useActivityLog();

  const refresh = () => {
    setRefreshCount((count) => count + 1);
    log('refreshKey changed');
  };

  return (
    <>
      <p className="intro">
        A regular React page: the components get <code>OrderStatsService</code> from context, props
        go in, callback props come out, and TypeScript checks every name and type.
      </p>

      <button type="button" className="toolbar-button" onClick={refresh}>
        Refresh statistics
      </button>

      <div className="layout">
        <OrderStats
          refreshKey={String(refreshCount)}
          onStatusPicked={({ status }) => log(`onStatusPicked({ status: ${status} })`)}
        />
        <ActivityFeed entries={entries} onCleared={clear} />
      </div>
    </>
  );
}
