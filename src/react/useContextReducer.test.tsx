import React, { Dispatch } from 'react'
import { create } from 'react-test-renderer'
import { createStore } from '..'
import { StoreContext, useContextReducer } from './useContextReducer'

describe(`${useContextReducer.name}`, () => {
    it(`should provide a default store`, () => {
        let dispatch: Dispatch<E> = undefined!
        function Sum() {
            const [state, _dispatch] = useContextReducer(sumReducer, () => 1)
            dispatch = _dispatch
            return <>{state}</>
        }

        const testInstance = create(<Sum />)
        expect(testInstance.toJSON()).toBe('1')
        dispatch({ type: 'add', value: 1 })
        expect(testInstance.toJSON()).toBe('2')
    })

    it(`should use store in ancestors if there is one`, () => {
        const store = createStore<E>([{ type: 'add', value: 1 }])

        function Sum() {
            const [state] = useContextReducer(sumReducer, () => 1)
            return <>{state}</>
        }

        const testInstance = create(
            <StoreContext.Provider value={store}>
                <Sum />
            </StoreContext.Provider>,
        )
        expect(testInstance.toJSON()).toBe('1')
        store.dispatch({ type: 'add', value: 1 })
        expect(testInstance.toJSON()).toBe('2')
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
    switch (event.type) {
        case 'add':
            return prev + event.value
        case 'minus':
            return prev - event.value
    }
}
