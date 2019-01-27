import { Observable } from 'rxjs'
import { attachProcess, createStore, GetState, toAsyncIterator } from '..'
import { createUseCase } from './createUseCase'

describe(`${createUseCase.name}`, () => {
    it(`should forward events to use case`, async () => {
        const receive = jest.fn()
        async function* useCase(
            inputs: Observable<E>,
            getState: GetState<E>,
        ): AsyncIterableIterator<E> {
            for await (const action of toAsyncIterator(inputs)) {
                const sum = getState(sumReducer, sumInitializer)
                if (sum % 3 === 0) yield { type: 'add', value: 1 }
            }
        }
        const store = createStore([], [attachProcess(createUseCase(useCase))])
        expect(store.getState(sumReducer, sumInitializer)).toEqual(0)
        store.dispatch({type: 'add', value: 1})
        store.dispatch({type: 'add', value: 2})
        await new Promise(t=> setTimeout(t))
        expect(store.getState(sumReducer, sumInitializer)).toEqual(4)
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

function sumInitializer(events: ReadonlyArray<E>) {
    return events.reduce(sumReducer, 0)
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
