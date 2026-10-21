export interface IRemoteConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}

export interface IRemoteElements {
  defineElements(config: IRemoteConfig): Promise<void>;
}
