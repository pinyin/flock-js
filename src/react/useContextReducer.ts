import { createContext, Dispatch, Reducer, useContext } from 'react'
import { createStore } from '../base/createStore'
import { StateInitializer } from '../base/types'
import { useExternalReducer } from './useExternalReducer'

export const StoreContext = createContext(createStore<any>([{}]))

export function useContextReducer<P, E>(
    reducer: Reducer<P, E>,
    initializer: StateInitializer<P, E>,
): [P, Dispatch<E>] {
    const store = useContext(StoreContext)
    return useExternalReducer(store, reducer, initializer)
}
