import { createStore, Store } from '..'
import { attachProcess, Process } from './attachProcess'

describe(`${attachProcess.name}`, () => {
    it(`should forward all events to process`, () => {
        const reducer = jest.fn()
        const initializer = jest.fn()
        const process: Process<E> = (store: Store<E>) => {
            store.getState(reducer, initializer)
            return store.subscribe(() => {
                store.getState(reducer, initializer)
            })
        }
        const store = createStore<E>(
            [{ type: 'add', value: 0 }],
            [attachProcess(process)],
        )
        expect(reducer).toBeCalledTimes(0)
        expect(initializer).toBeCalledTimes(1)
        store.replaceEvents([], store.cursor())
        store.replaceEvents([], store.cursor())
        expect(reducer).toBeCalledTimes(0)
        expect(initializer).toBeCalledTimes(3)
        store.dispatch({ type: 'add', value: 1 })
        expect(reducer).toBeCalledTimes(1)
        expect(initializer).toBeCalledTimes(3)
    })
    it(`should restart process on replaceEvents`, () => {
        const reducer = jest.fn()
        const subscriber = jest.fn(reducer)
        const initializer = jest.fn()
        const terminate = jest.fn()
        const process: Process<E> = (store: Store<E>) => {
            store.getState(reducer, initializer)
            const unsubscribe = store.subscribe(subscriber)
            return () => {
                terminate()
                unsubscribe()
            }
        }
        const store = createStore<E>(
            [{ type: 'add', value: 0 }],
            [attachProcess(process)],
        )
        expect(reducer).toBeCalledTimes(0)
        expect(initializer).toBeCalledTimes(1)
        expect(subscriber).toBeCalledTimes(0)
        expect(terminate).toBeCalledTimes(0)
        store.replaceEvents([], store.cursor())
        store.replaceEvents([], store.cursor())
        expect(reducer).toBeCalledTimes(0)
        expect(initializer).toBeCalledTimes(3)
        expect(subscriber).toBeCalledTimes(0)
        expect(terminate).toBeCalledTimes(2)
        store.dispatch({ type: 'add', value: 0 })
        expect(reducer).toBeCalledTimes(1)
        expect(initializer).toBeCalledTimes(3)
        expect(subscriber).toBeCalledTimes(1)
        expect(terminate).toBeCalledTimes(2)
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
