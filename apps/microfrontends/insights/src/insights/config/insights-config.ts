export interface IInsightsConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}
