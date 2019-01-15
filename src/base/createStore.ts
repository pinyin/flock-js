import { Reducer } from 'react'
import {
    StateInitializer,
    StoreEnhancer,
    StoreForEnhancer,
    Subscriber,
    Unsubscribe,
} from '../types'

export function createStore<E>(
    prepublish: Array<E>,
    enhancers: Array<StoreEnhancer<E>> = [],
): StoreForEnhancer<E> {
    return enhancers.reduceRight(
        (acc, curr) => curr(acc),
        (prepublish: Array<E>) => createInnerStore(prepublish),
    )(prepublish)
}

function createInnerStore<E>(prepublish: Array<E>): StoreForEnhancer<E> {
    const _subscribers = new Set<Subscriber>()
    let _events = prepublish
    let _cursor = _events.length
    let _stateCache = new WeakMap<Reducer<any, E>, StateCacheItem>()

    return {
        events: () => {
            return _events
        },
        cursor: () => {
            return _cursor
        },
        replaceEvents: (events: Array<E>, cursor?: number) => {
            if (events !== _events) {
                _events = events
                _stateCache = new WeakMap()
            }
            if (typeof cursor === 'number' && cursor !== _cursor) {
                _cursor = cursor
                _stateCache = new WeakMap()
            }
        },
        dispatch: (e: E) => {
            _events.push(e)
            _cursor++
            _subscribers.forEach(s => s()) // FIXME try-catch
        },
        getState: <P>(
            reducer: Reducer<P, E>,
            initializer: StateInitializer<P, E>,
        ): P => {
            const isCacheUsable =
                _stateCache.has(reducer) &&
                _stateCache.get(reducer)!.cursor <= _cursor
            const prev = isCacheUsable
                ? _stateCache.get(reducer)!
                : {
                      state: initializer(_events),
                      cursor: _cursor,
                  }
            let next = prev.state
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
