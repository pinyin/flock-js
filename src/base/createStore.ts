import { Reducer } from 'react'
import { GetStateParams, ReduxReducer, StoreEnhancer, StoreForEnhancer, Subscriber, Unsubscribe } from '../types'

export function createStore<E>(
    storage: Array<E>,
    enhancers: Array<StoreEnhancer<E>> = [],
): StoreForEnhancer<E> {
    return enhancers.reduceRight(
        (acc, curr) => curr(acc),
        (storage: Array<E>) => createInnerStore(storage),
    )(storage)
}

function createInnerStore<E>(storage: Array<E>): StoreForEnhancer<E> {
    const _subscribers = new Set<Subscriber>()
    let _events = storage
    let _cursor = _events.length
    let _stateCache = new WeakMap<Reducer<any, E>, StateCacheItem>()

    return {
        get cursor() {
            return _cursor
        },
        set cursor(cursor: number) {
            _cursor = cursor
        },
        get events() {
            return _events
        },
        set events(events: Array<E>) {
            _events = events
        },
        dispatch: (e: E) => {
            _events.push(e)
            _cursor++
            _subscribers.forEach(s => s()) // FIXME try-catch
        },
        getState: <P>(...params: GetStateParams<P, E>): P => {
            const [reducer, initializer] = params
            const isCacheReusable =
                _stateCache.has(reducer) &&
                _stateCache.get(reducer)!.cursor <= _cursor
            const prev: StateCacheItem = isCacheReusable
                ? _stateCache.get(reducer)!
                : {
                      state:
                          typeof initializer !== 'function'
                              ? _events.reduce(
                                    reducer as ReduxReducer<P, E>,
                                    undefined,
                                )
                              : initializer(_events),
                      cursor: _cursor,
                  }
            let next: P = prev.state
            for (let i = _cursor - prev.cursor; i > 0; i--) {
                next = reducer(next, _events[_events.length - i])
            }
            _stateCache.set(reducer, { cursor: _cursor, state: next })
            return next
        },
        subscribe: (subscriber: Subscriber): Unsubscribe => {
            _subscribers.add(subscriber)
            return () => _subscribers.delete(subscriber)
        },
    }
}

type StateCacheItem = {
    cursor: number
    state: any
}
