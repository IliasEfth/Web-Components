import { useState } from 'react';
import { useActivityLog } from '../shared/useActivityLog';

export function WebComponentsPage() {
  const [refreshCount, setRefreshCount] = useState(0);
  const { entries, log, clear } = useActivityLog();

  const refresh = () => {
    setRefreshCount((count) => count + 1);
    log('refresh-key attribute changed');
  };

  return (
    <>
      <p className="intro">
        The same components as custom elements, registered by{' '}
        <code>defineElements({'{ apiBase }'})</code> before the app starts: attributes and
        properties in, DOM events out, exactly the way Angular, Vue and Angular 16 will use them.
      </p>

      <button type="button" className="toolbar-button" onClick={refresh}>
        Refresh statistics
      </button>

      <div className="layout">
        <shop-order-stats
          refresh-key={String(refreshCount)}
          onstatusPicked={(event) => log(`statusPicked { status: ${event.detail.status} }`)}
        />
        <shop-activity-feed entries={entries} oncleared={clear} />
      </div>
    </>
  );
}
