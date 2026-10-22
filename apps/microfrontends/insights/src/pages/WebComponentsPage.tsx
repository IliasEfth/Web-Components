import type {
  IActivityFeedContract,
  IOrderStatsContract,
  IStatusPickedDetail,
} from '@shop/insights-contract';
import { useEffect, useRef, useState } from 'react';
import { useActivityLog } from '../shared/useActivityLog';

type OrderStatsElement = HTMLElement & Partial<IOrderStatsContract['properties']>;
type ActivityFeedElement = HTMLElement & Partial<IActivityFeedContract['properties']>;

export function WebComponentsPage() {
  const [refreshCount, setRefreshCount] = useState(0);
  const { entries, log, clear } = useActivityLog();
  const statsRef = useRef<OrderStatsElement>(null);
  const feedRef = useRef<ActivityFeedElement>(null);

  useEffect(() => {
    const stats = statsRef.current;
    const statusPicked = (event: Event) => {
      const { status } = (event as CustomEvent<IStatusPickedDetail>).detail;
      log(`statusPicked { status: ${status} }`);
    };
    stats?.addEventListener('statusPicked', statusPicked);
    return () => stats?.removeEventListener('statusPicked', statusPicked);
  }, [log]);

  useEffect(() => {
    const feed = feedRef.current;
    feed?.addEventListener('cleared', clear);
    return () => feed?.removeEventListener('cleared', clear);
  }, [clear]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.entries = entries;
    }
  }, [entries]);

  const refresh = () => {
    setRefreshCount((count) => count + 1);
    log('refresh-key attribute changed');
  };

  return (
    <>
      <p className="intro">
        The same components as custom elements, registered by{' '}
        <code>defineElements({'{ apiBase }'})</code> before the app starts. React 18 only sets
        attributes on custom elements, so this page sets the <code>entries</code> property and
        listens to the DOM events through refs.
      </p>

      <button type="button" className="toolbar-button" onClick={refresh}>
        Refresh statistics
      </button>

      <div className="layout">
        <shop-order-stats ref={statsRef} refresh-key={String(refreshCount)} />
        <shop-activity-feed ref={feedRef} />
      </div>
    </>
  );
}
