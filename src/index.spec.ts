import { ObservableMap, ObservableMapEvent } from './index'
import { last, scan, take, timeout } from 'rxjs/operators'
import { combineLatest } from 'rxjs'

describe('package api', () => {

  it('should ', () => {
    expect(new ObservableMap()).toBeInstanceOf(ObservableMap)
  })

  it('should has', () => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])
    expect(sut.has('v2')).toEqual(true)
  })

  it('should get', () => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])
    expect(sut.get('v2')).toEqual(5)
  })

  it('should get values', () => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])
    expect(Array.from(sut.values())).toEqual([2, 5])
  })

  it('should get keys', () => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])
    expect(Array.from(sut.keys())).toEqual(['v1', 'v2'])
  })

  it('should get entries', () => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])
    expect(Array.from(sut.entries())).toEqual([['v1', 2], ['v2', 5]])
  })

  it('should get size', () => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])

    expect(sut.size).toEqual(2)
  })

  it('should forEach', () => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])

    let execCount = 0

    sut.forEach(a => {
      execCount += a
    })

    expect(execCount).toEqual(7)
  })

  it('should add', done => {
    const sut = new ObservableMap<string, { haro: number }>()
    expect(sut.size).toEqual(0)

    const onEvent = sut.onEvent$.pipe(take(1))
    const onAdded = sut.onAdded$.pipe(take(1))

    combineLatest([onAdded, onEvent])
      .subscribe(res => {
        expect(res[0].type).toEqual(ObservableMapEvent.Added)
        expect(res[1].type).toEqual(ObservableMapEvent.Added)
        expect(res[0].value).toEqual({ haro: 123 })
        expect(res[1].value).toEqual({ haro: 123 })
        expect(sut.size).toEqual(1)
      }, () => { }, done)

    sut.set('test', { haro: 123 })
  })

  it('should not add when same value', done => {
    const sut = new ObservableMap<string, { haro: number }>([['test', { haro: 123 }]])
    expect(sut.size).toEqual(1)

    const onEvent = sut.onEvent$.pipe(take(1))
    const onAdded = sut.onAdded$.pipe(take(1))

    combineLatest([onAdded, onEvent]).pipe(timeout(10))
      .subscribe(() => {
        expect(false).toEqual(true)
      }, () => {
        expect(sut.size).toEqual(1)
        done()
      }, () => {
        expect(false).toEqual(true)
      })

    sut.set('test', { haro: 123 })
  })

  it('should add when different value', done => {
    const sut = new ObservableMap<string, { haro: number }>([['test', { haro: 12 }]])
    expect(sut.size).toEqual(1)

    const onEvent = sut.onEvent$.pipe(take(1))
    const onChanged = sut.onChanged$.pipe(take(1))

    combineLatest([onChanged, onEvent])
      .subscribe(res => {
        expect(res[0].key).toEqual('test')
        expect(res[0].value).toEqual({ haro: 123 })
      }, () => { }, done)

    sut.set('test', { haro: 123 })
  })

  it('should delete', done => {
    const sut = new ObservableMap<string, { haro: number }>([['test', { haro: 12 }]])
    expect(sut.size).toEqual(1)

    const onEvent = sut.onEvent$.pipe(take(1))
    const onRemoved = sut.onRemoved$.pipe(take(1))

    combineLatest([onRemoved, onEvent])
      .subscribe(res => {
        expect(res[0].type).toEqual(ObservableMapEvent.Removed)
        // expect(res[0].key).toEqual('test')
        // expect(res[0].value).toEqual({ haro: 123 })
        expect(sut.size).toEqual(0)
      }, () => { }, done)

    sut.delete('test')
  })

  it('should try delete, not emit', done => {
    const sut = new ObservableMap<string, unknown>([['test', undefined]])
    expect(sut.size).toEqual(1)

    const onEvent = sut.onEvent$.pipe(take(1))
    const onRemoved = sut.onRemoved$.pipe(take(1))

    combineLatest([onRemoved, onEvent]).pipe(timeout(10))
      .subscribe(() => {
        expect(false).toEqual(true)
        done()
      }, () => { 
        done()
      }, () => {
        expect(false).toEqual(true)
      })

    sut.delete('test')
  })

  it('should clear', done => {
    const sut = new ObservableMap([['v1', 2], ['v2', 5]])
    expect(sut.size).toEqual(2)

    sut.onEvent$
      .pipe(
        scan((acc, curr) => {
          return {
            ...acc,
            [curr.key]: curr
          }
        }, []),
        take(2),
        last()
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((res: any) => {
        expect(res.v1.value).toEqual(2)
        expect(res.v2.value).toEqual(5)
      }, () => { }, done)

    sut.clear()
  })

})
