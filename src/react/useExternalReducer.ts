import { Dispatch, Reducer, useLayoutEffect, useState } from 'react'
import { GetStateParams, ReduxReducer, StateInitializer, Store } from '../types'

export function useExternalReducer<P, E>(
    store: Store<E>,
    reducer: Reducer<P, E>,
    initializer: StateInitializer<P, E>,
): [P, Dispatch<E>]
export function useExternalReducer<P, E>(
    store: Store<E>,
    reducer: ReduxReducer<P, E>,
): [P, Dispatch<E>]
export function useExternalReducer<P, E>(
    store: Store<E>,
    ...params: GetStateParams<P, E>
): [P, Dispatch<E>] {
    const [state, setState] = useState(() => store.getState(...params))

    useLayoutEffect(
        () => {
            let prev = state
            return store.subscribe(() => {
                const next = store.getState(...params)
                if (next !== prev) {
                    setState(next)
                    prev = next
                }
            })
        },
        [store, ...params],
    )

    return [state, store.dispatch]
}
