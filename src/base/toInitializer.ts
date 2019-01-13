import { StateInitializer } from '../types'

export function toInitializer<P, E>(
    reducer: ReduxReducer<P, E>,
): StateInitializer<P, E> {
    return (events: ReadonlyArray<E>) =>
        events.reduce<P>(
            (acc, curr) => reducer(acc, curr),
            reducer(undefined, { type: INIT }),
        )
}

export type ReduxReducer<P, E> = {
    bivarianceHack(prev: P | undefined, event: E | { type: any }): P
}['bivarianceHack'] // TODO find out why this works

const INIT = Symbol('INIT')
