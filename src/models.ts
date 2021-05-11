export enum ObservableMapEvent {
  Added,
  Removed,
  Changed
}

export interface IObservableMapEvent<TKey, TValue>  {
  readonly type: ObservableMapEvent
  readonly key: TKey
  readonly value: TValue
}
