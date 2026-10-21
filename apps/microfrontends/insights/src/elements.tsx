import type { ReactNode } from 'react';
import { ActivityFeed } from './insights/components/activity-feed/ActivityFeed';
import activityFeedStyles from './insights/components/activity-feed/activity-feed.css?inline';
import { OrderStats } from './insights/components/order-stats/OrderStats';
import orderStatsStyles from './insights/components/order-stats/order-stats.css?inline';
import { InsightsProvider } from './insights/config/InsightsProvider';
import type { IInsightsConfig } from './insights/config/insights-config';
import { defineReactElement } from './web-components/define-react-element';

let elementsDefined: Promise<void> | undefined;

export function defineElements(config: IInsightsConfig): Promise<void> {
  elementsDefined ??= Promise.resolve().then(() => registerElements(config));
  return elementsDefined;
}

function registerElements(config: IInsightsConfig): void {
  const withInsights = (element: ReactNode) => (
    <InsightsProvider config={config}>{element}</InsightsProvider>
  );

  defineReactElement('shop-order-stats', OrderStats, {
    inputs: ['refreshKey'],
    outputs: ['onStatusPicked'],
    styles: orderStatsStyles,
    wrap: withInsights,
  });

  defineReactElement('shop-activity-feed', ActivityFeed, {
    inputs: ['entries'],
    outputs: ['onCleared'],
    styles: activityFeedStyles,
  });
}
