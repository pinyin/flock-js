import { Dispatch, Reducer } from 'react'

export interface Store<E> {
    readonly subscribe: Subscribe
    readonly getState: GetState<E>
    readonly dispatch: Dispatch<E>
    readonly events: GetEvents<E>
}

export interface GetEvents<E> {
    (): ReadonlyArray<E>
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
    <P>(reducer: Reducer<P, E>, initializer: StateInitializer<P, E>): P
}

export interface StateInitializer<P, E> {
    (events: ReadonlyArray<E>): P
}

export interface StoreForEnhancer<E> extends Store<E> {
    refresh(): void
    cursor(): number
    replaceEvents(events: Array<E>, cursor?: number): void
}

export interface StoreEnhancer<E> {
    (inner: StoreCreator<E>): StoreCreator<E>
}

export interface StoreCreator<E> {
    (prepublish: Array<E>): StoreForEnhancer<E>
}
