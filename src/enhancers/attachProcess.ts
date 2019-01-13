import {
    Store,
    StoreCreator,
    StoreEnhancer,
    StoreForEnhancer,
    Unsubscribe,
} from '../types'

export function attachProcess<E>(...processes: Process<E>[]): StoreEnhancer<E> {
    return (inner: StoreCreator<E>) => (
        prepublish: Array<E>,
    ): StoreForEnhancer<E> => {
        const _store = inner(prepublish)
        const _terminators = new Set()
        processes.forEach(process => _terminators.add(process(_store)))

        return {
            ..._store,
            replaceEvents: (events: Array<E>, cursor?: number): void => {
                _terminators.forEach(terminate => terminate()) // TODO try-catch
                _terminators.clear()
                _store.replaceEvents(events, cursor)
                processes.forEach(process => _terminators.add(process(_store)))
            },
        }
    }
}

export interface Process<E> {
    (store: Store<E>): Unsubscribe
}
