import { Dispatch, Reducer } from 'react'

export interface Store<E> {
    subscribe: Subscribe
    getState: GetState<E>
    dispatch: Dispatch<E>
}

export interface Subscribe {
    (subscriber: Subscriber): Unsubscribe
}
export interface Subscriber {
    (): void
}
export interface Unsubscribe {
    (): void
}

export interface GetState<E> {
    <P>(reducer: ReduxReducer<P, E>): P
    <P>(reducer: Reducer<P, E>, initialState: StateInitializer<P, E>): P
    <P>(...params: GetStateParams<P, E>): P
}

export type GetStateParams<P, E> =
    | [ReduxReducer<P, E>]
    | [Reducer<P, E>, StateInitializer<P, E>]

export interface ReduxReducer<P, E> {
    (prevState: P | undefined, event: E): P
}

export interface StateInitializer<P, E> {
    (events: ReadonlyArray<E>): P
}

export interface StoreForEnhancer<E> extends Store<E> {
    cursor: number
    events: Array<E>
}

export interface StoreEnhancer<E> {
    (inner: StoreCreator<E>): StoreCreator<E>
}

export interface StoreCreator<E> {
    (storage: Array<E>): StoreForEnhancer<E>
}
