import { Store } from '../types'
import { createStore } from './createStore'

describe(`${createStore.name}`, () => {
    let store: Store<E>
    it(`should return an empty store`, () => {
        store = createStore<E>([{ type: 'add', value: 1 }])
        const count = store.getState<number>(countReducer, countInitializer)
        expect(count).toBe(1)
    })
    it(`should support initialize reducer`, () => {
        store.dispatch({ type: 'add', value: 2 })
        const sum = store.getState<number>(sumReducer)
        expect(sum).toBe(3)
    })
    it(`should call subscriber after an event is dispatched`, () => {
        const subscriber = jest.fn()
        const unsubscribe = store.subscribe(subscriber)
        store.dispatch({ type: 'add', value: 2 })
        store.dispatch({ type: 'add', value: 2 })
        expect(subscriber).toBeCalledTimes(2)
        unsubscribe()
    })
    it(`should cache result for the same reducer`, () => {
        const reducer = jest.fn()
        const eventCount = store.getState<number>(
            countReducer,
            countInitializer,
        )
        store.getState<number>(reducer)
        expect(reducer).toBeCalledTimes(eventCount)
        store.getState<number>(reducer)
        expect(reducer).toBeCalledTimes(eventCount)
        store.dispatch({ type: 'add', value: 2 })
        store.getState<number>(reducer)
        expect(reducer).toBeCalledTimes(eventCount + 1)
    })
    it(`should use initializer iff no cache is present`, () => {
        const reducer = jest.fn()
        const initializer = jest.fn()
        store.getState<number>(reducer, initializer)
        expect(initializer).toBeCalledTimes(1)
        expect(reducer).toBeCalledTimes(0)
        store.dispatch({ type: 'add', value: 2 })
        store.getState<number>(reducer, initializer)
        expect(initializer).toBeCalledTimes(1)
        expect(reducer).toBeCalledTimes(1)
        store.dispatch({ type: 'add', value: 2 })
        store.dispatch({ type: 'add', value: 2 })
        store.getState<number>(reducer, initializer)
        expect(initializer).toBeCalledTimes(1)
        expect(reducer).toBeCalledTimes(3)
    })
})

type E =
    | {
          type: 'add'
          value: number
      }
    | {
          type: 'minus'
          value: number
      }

function countReducer<E>(prev: number, event: E) {
    return prev + 1
}

function countInitializer(events: ReadonlyArray<E>): number {
    return events.length
}

function sumReducer(prev: number | undefined, event: E) {
    prev = prev || 0
    switch (event.type) {
        case 'add':
            return prev + event.value
        case 'minus':
            return prev - event.value
    }
}