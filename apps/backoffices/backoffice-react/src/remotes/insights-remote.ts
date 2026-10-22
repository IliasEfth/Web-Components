let insightsReady: Promise<void> | undefined;

export function loadInsightsElements(): Promise<void> {
  insightsReady ??= import('insights/elements')
    .then(({ defineElements }) => defineElements())
    .catch((error: unknown) => {
      insightsReady = undefined;
      throw error;
    });
  return insightsReady;
}
