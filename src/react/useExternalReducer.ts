import { Dispatch, Reducer, useLayoutEffect, useState } from 'react'
import { StateInitializer, Store } from '../base/types'

export function useExternalReducer<P, E>(
    store: Store<E>,
    reducer: Reducer<P, E>,
    initializer: StateInitializer<P, E>,
): [P, Dispatch<E>] {
    const [state, setState] = useState(() =>
        store.getState(reducer, initializer),
    )

    useLayoutEffect(
        () => {
            let prev = state
            return store.subscribe(() => {
                const next = store.getState(reducer, initializer)
                if (next !== prev) {
                    setState(next)
                    prev = next
                }
            })
        },
        [store, reducer],
    )

    return [state, store.dispatch]
}
