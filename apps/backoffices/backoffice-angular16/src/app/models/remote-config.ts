import { InjectionToken } from '@angular/core';
import type { IRemoteConfig } from '@shop/orders-contract';

export const REMOTE_CONFIG = new InjectionToken<IRemoteConfig>('REMOTE_CONFIG');
