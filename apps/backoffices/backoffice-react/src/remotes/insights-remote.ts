import { remoteConfig } from '../app-config';

let insightsReady: Promise<void> | undefined;

export function loadInsightsElements(): Promise<void> {
  insightsReady ??= import('insights/elements')
    .then(({ defineElements }) => defineElements(remoteConfig))
    .catch((error: unknown) => {
      insightsReady = undefined;
      throw error;
    });
  return insightsReady;
}
