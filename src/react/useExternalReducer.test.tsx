import * as React from 'react'
import { create } from 'react-test-renderer'
import { createStore } from '../base/createStore'
import { useExternalReducer } from './useExternalReducer'

describe(`${useExternalReducer.name}`, () => {
    it(`should initialize state when component created`, () => {
        const render = jest.fn(v => v.toString())
        const store = createStore<E>([{ type: 'add', value: 1 }])

        function Sum() {
            const [state] = useExternalReducer(store, sumReducer)
            return <>{render(state)}</>
        }
        const testInstance = create(<Sum />)
        expect(testInstance.toJSON()).toBe('1')
    })

    it(`should update component with store`, async () => {
        const render = jest.fn(v => v.toString())
        const store = createStore<E>([{ type: 'add', value: 1 }])

        function Sum() {
            const [state] = useExternalReducer(store, sumReducer)
            return <>{render(state)}</>
        }
        const testInstance = create(<Sum />)
        expect(testInstance.toJSON()).toBe('1')
        store.dispatch({ type: 'add', value: 1 })
        expect(testInstance.toJSON()).toBe('2')
    })

    it(`should trigger rerender iff state !== previous state`, () => {
        const render = jest.fn(v => v.toString())
        const store = createStore<E>([{ type: 'add', value: 1 }])

        function Sum() {
            const [state] = useExternalReducer(store, sumReducer)
            return <>{render(state)}</>
        }
        const testInstance = create(<Sum />)
        expect(testInstance.toJSON()).toBe('1')
        store.dispatch({ type: 'add', value: 1 })
        expect(testInstance.toJSON()).toBe('2')
        expect(render).toBeCalledTimes(2)
        store.dispatch({ type: 'add', value: 0 })
        expect(render).toBeCalledTimes(2)
        store.dispatch({ type: 'add', value: 1 })
        expect(testInstance.toJSON()).toBe('3')
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
