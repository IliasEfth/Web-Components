import type {
  IActivityFeedContract,
  IInsightsRemote,
  IOrderStatsContract,
} from '@shop/insights-contract';
import type { ReactNode } from 'react';
import { ActivityFeed } from './insights/components/activity-feed/ActivityFeed';
import activityFeedStyles from './insights/components/activity-feed/activity-feed.css?inline';
import { OrderStats } from './insights/components/order-stats/OrderStats';
import orderStatsStyles from './insights/components/order-stats/order-stats.css?inline';
import { InsightsProvider } from './insights/config/InsightsProvider';
import { insightsConfig } from './insights/config/insights-config';
import { defineReactElement } from './web-components/define-react-element';

let elementsDefined: Promise<void> | undefined;

export const defineElements: IInsightsRemote['defineElements'] = () => {
  elementsDefined ??= Promise.resolve().then(() => registerElements());
  return elementsDefined;
};

function registerElements(): void {
  const withInsights = (element: ReactNode) => (
    <InsightsProvider config={insightsConfig}>{element}</InsightsProvider>
  );

  defineReactElement('shop-order-stats' satisfies IOrderStatsContract['tagName'], OrderStats, {
    inputs: ['refreshKey'],
    outputs: ['onStatusPicked'],
    styles: orderStatsStyles,
    wrap: withInsights,
  });

  defineReactElement('shop-activity-feed' satisfies IActivityFeedContract['tagName'], ActivityFeed, {
    inputs: ['entries'],
    outputs: ['onCleared'],
    styles: activityFeedStyles,
  });
}
