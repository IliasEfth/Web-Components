interface IElementContract {
  properties: object;
  events: object;
}

export type ComponentProps<TContract extends IElementContract> = Partial<
  TContract['properties']
> & {
  [K in keyof TContract['events'] as `on${Capitalize<K & string>}`]?: (
    detail: TContract['events'][K],
  ) => void;
};
