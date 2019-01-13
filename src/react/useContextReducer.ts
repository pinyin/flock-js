import { createContext, Dispatch, Reducer, useContext } from 'react'
import { createStore } from '../base/createStore'
import { GetStateParams, ReduxReducer, StateInitializer } from '../types'
import { useExternalReducer } from './useExternalReducer'

const StoreContext = createContext(createStore<any>([]))

export function useContextReducer<P, E>(
    reducer: ReduxReducer<P, E>,
): [P, Dispatch<E>]
export function useContextReducer<P, E>(
    reducer: Reducer<P, E>,
    initializer: StateInitializer<P, E>,
): [P, Dispatch<E>]
export function useContextReducer<P, E>(
    ...params: GetStateParams<P, E>
): [P, Dispatch<E>] {
    const store = useContext(StoreContext)
    return useExternalReducer(store, params[0], params[1] as any)
}
