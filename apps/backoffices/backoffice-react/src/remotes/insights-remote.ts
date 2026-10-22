import type { IInsightsRemote } from '@shop/insights-contract';
import { moduleFederation } from './module-federation';

let insightsReady: Promise<void> | undefined;

export function loadInsightsElements(): Promise<void> {
  insightsReady ??= moduleFederation
    .loadRemote<IInsightsRemote>('insights/elements')
    .then((elements) => {
      if (!elements) {
        throw new Error('insights exposes no elements');
      }
      return elements.defineElements();
    })
    .catch((error: unknown) => {
      insightsReady = undefined;
      throw error;
    });
  return insightsReady;
}
