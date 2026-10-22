import type { Observable } from 'rxjs';

export type ObservableApi<TApi> = {
  [K in keyof TApi]: TApi[K] extends (...args: infer TArgs) => Promise<infer TResult>
    ? (...args: TArgs) => Observable<TResult>
    : never;
};
