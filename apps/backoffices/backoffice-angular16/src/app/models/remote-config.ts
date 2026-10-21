import { InjectionToken } from '@angular/core';

export interface IRemoteConfig {
  apiBase: string;
  getAuthToken?: () => string | undefined;
}

export interface IRemoteElements {
  defineElements(config: IRemoteConfig): Promise<void>;
}

export const REMOTE_CONFIG = new InjectionToken<IRemoteConfig>('REMOTE_CONFIG');
