/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Subject } from 'rxjs'
import { filter, share } from 'rxjs/operators'
import { IObservableMapEvent, ObservableMapEvent } from './models'

export class ObservableMap<TKey, TValue> {

  private readonly map;
  private readonly changeSource = new Subject<IObservableMapEvent<TKey, TValue>>();

  readonly onEvent$ = this.changeSource.pipe(share());
  readonly onAdded$ = this.onEvent$.pipe(filter(a => a.type === ObservableMapEvent.Added));
  readonly onRemoved$ = this.onEvent$.pipe(filter(a => a.type === ObservableMapEvent.Removed));
  readonly onChanged$ = this.onEvent$.pipe(filter(a => a.type === ObservableMapEvent.Changed));

  constructor()
  constructor(entries?: Iterable<readonly [TKey, TValue]>)
  constructor(entries?: (readonly (readonly [TKey, TValue])[]))
  constructor(entries?: (Iterable<readonly [TKey, TValue]>) | (readonly (readonly [TKey, TValue])[])) {
    this.map = new Map<TKey, TValue>(entries as unknown as Iterable<readonly [TKey, TValue]>)
  }

  private emitEvent(type: ObservableMapEvent, key: TKey, value: TValue): void {
    this.changeSource.next({ type, key, value })
  }

  private emitAddedEvent(key: TKey, value: TValue): void {
    this.emitEvent(ObservableMapEvent.Added, key, value)
  }

  private emitRemovedEvent(key: TKey, value: TValue): void {
    this.emitEvent(ObservableMapEvent.Removed, key, value)
  }

  private emitChangedEvent(key: TKey, value: TValue): void {
    this.emitEvent(ObservableMapEvent.Changed, key, value)
  }

  get size(): number {
    return this.map.size
  }

  values(): IterableIterator<TValue> {
    return this.map.values()
  }

  entries(): IterableIterator<[TKey, TValue]> {
    return this.map.entries()
  }

  keys(): IterableIterator<TKey> {
    return this.map.keys()
  }

  has(key: TKey): boolean {
    return this.map.has(key)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forEach(callbackfn: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void, thisArg?: any): void {
    return this.map.forEach(callbackfn, thisArg)
  }

  get(key: TKey): TValue | undefined {
    return this.map.get(key)
  }

  set(key: TKey, value: TValue): this {
    const existing = this.map.get(key)

    if (existing && (existing === value || JSON.stringify(existing) === JSON.stringify(value))) return this

    this.map.set(key, value)

    if (existing) {
      this.emitChangedEvent(key, value)
    } else {
      this.emitAddedEvent(key, value)
    }

    return this
  }

  delete(key: TKey): boolean {
    const value = this.map.get(key)
    const result = this.map.delete(key)

    if (result && value) {
      this.emitRemovedEvent(key, value)
    }

    return result
  }

  clear(): void {
    const copy = Array.from(this.map)

    this.map.clear()

    copy.forEach(([key, value]) => this.emitRemovedEvent(key, value))
  }

}
