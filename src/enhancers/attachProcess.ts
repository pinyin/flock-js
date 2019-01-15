import {
    Store,
    StoreCreator,
    StoreEnhancer,
    StoreForEnhancer,
    Unsubscribe,
} from '../base/types'

export function attachProcess<E>(...processes: Process<E>[]): StoreEnhancer<E> {
    return (inner: StoreCreator<E>): StoreCreator<E> => (
        prepublish: Array<E>,
    ): StoreForEnhancer<E> => {
        const _terminators = new Set()

        const innerStore = inner(prepublish)

        const store: StoreForEnhancer<E> = {
            ...innerStore,
            replaceEvents: (events: Array<E>, cursor?: number): void => {
                _terminators.forEach(terminate => terminate()) // TODO try-catch
                _terminators.clear()
                innerStore.replaceEvents(events, cursor)
                processes.forEach(process => _terminators.add(process(store)))
            },
        }

        processes.forEach(process => _terminators.add(process(store)))

        return store
    }
}

export interface Process<E> {
    (store: Store<E>): Unsubscribe
}
