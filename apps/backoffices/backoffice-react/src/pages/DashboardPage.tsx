import { useNavigate } from 'react-router';
import { loadInsightsElements } from '../remotes/insights-remote';
import { loadOrdersElements } from '../remotes/orders-remote';
import { RemoteGate } from '../remotes/RemoteGate';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      <p className="intro">
        The shell never calls the API: the statistics come from Insights, the open orders from
        Orders. Open an order to see its detail.
      </p>

      <div className="stack">
        <RemoteGate name="Insights" load={loadInsightsElements}>
          <shop-order-stats />
        </RemoteGate>
        <RemoteGate name="Orders" load={loadOrdersElements}>
          <shop-orders-list
            status="open"
            page-size="5"
            onorderSelected={(event) => navigate(`/orders/${event.detail.id}`)}
          />
        </RemoteGate>
      </div>
    </>
  );
}
