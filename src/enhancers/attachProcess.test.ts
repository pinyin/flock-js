import { createStore, Store } from '..'
import { toInitializer } from '../base/toInitializer'
import { attachProcess, Process } from './attachProcess'

describe(`${attachProcess.name}`, () => {
    it(`should forward all events to process`, () => {
        const receive = jest.fn()
        const reducer = jest.fn()
        const process: Process<E> = (store: Store<E>) => {
            store.getState(reducer, toInitializer(reducer))
            return store.subscribe(receive)
        }
        const store = createStore<E>(
            [{ type: 'add', value: 0 }],
            [attachProcess(process)],
        )
        expect(reducer).toBeCalledTimes(2)
        expect(receive).toBeCalledTimes(0)
        store.replaceEvents([])
        store.replaceEvents([])
        expect(reducer).toBeCalledTimes(4)
        expect(receive).toBeCalledTimes(0)
        store.dispatch({ type: 'add', value: 0 })
        expect(receive).toBeCalledTimes(1)
    })
    it(`should restart process on replaceEvents`, () => {
        const receive = jest.fn()
        const reducer = jest.fn()
        const terminate = jest.fn()
        const process: Process<E> = (store: Store<E>) => {
            store.getState(reducer, toInitializer(reducer))
            const unsubscribe = store.subscribe(receive)
            return () => {
                terminate()
                unsubscribe()
            }
        }
        const store = createStore<E>(
            [{ type: 'add', value: 0 }],
            [attachProcess(process)],
        )
        expect(reducer).toBeCalledTimes(2)
        expect(receive).toBeCalledTimes(0)
        expect(terminate).toBeCalledTimes(0)
        store.replaceEvents([])
        store.replaceEvents([])
        expect(terminate).toBeCalledTimes(2)
        expect(reducer).toBeCalledTimes(4)
        expect(receive).toBeCalledTimes(0)
        store.dispatch({ type: 'add', value: 0 })
        expect(receive).toBeCalledTimes(1)
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

function sumReducer(prev: number | undefined, event: E) {
    prev = prev || 0
    switch (event.type) {
        case 'add':
            return prev + event.value
        case 'minus':
            return prev - event.value
    }
}
