import * as React from 'react'
import { create } from 'react-test-renderer'
import { createStore } from '..'
import { StoreBuilder } from './StoreBuilder'

describe(`${StoreBuilder.name}`, () => {
    it(`should pass store state to children when state updates`, () => {
        const store = createStore<E>()
        const render = jest.fn(v => v.toString())
        const testInstance = create(
            <StoreBuilder
                store={store}
                reducer={sumReducer}
                initializer={() => 1}
            >
                {state => <>{render(state)}</>}
            </StoreBuilder>,
        )
        expect(testInstance.toJSON()).toBe('1')
        store.dispatch({ type: 'add', value: 1 })
        expect(testInstance.toJSON()).toBe('2')
        expect(render).toBeCalledTimes(2)
        store.dispatch({ type: 'add', value: 0 })
        expect(render).toBeCalledTimes(2)
        store.dispatch({ type: 'add', value: 1 })
        expect(render).toBeCalledTimes(3)
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

function sumReducer(prev: number, event: E) {
    prev = prev || 0
    switch (event.type) {
        case 'add':
            return prev + event.value
        case 'minus':
            return prev - event.value
    }
}
