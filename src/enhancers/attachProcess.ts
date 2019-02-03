import { Store, StoreCreator, StoreEnhancer, StoreForEnhancer, Unsubscribe } from '..'

export function attachProcess<E>(...processes: Process<E>[]): StoreEnhancer<E> {
    return (inner: StoreCreator<E>): StoreCreator<E> => (
        prepublish: Array<E>,
    ): StoreForEnhancer<E> => {
        const _terminators = new Set()

        const _store = inner(prepublish)

        const store: StoreForEnhancer<E> = {
            ..._store,
            replaceEvents: (events: Array<E>, cursor?: number): void => {
                if (cursor !== _store.cursor()) {
                    _terminators.forEach(terminate => terminate())
                    _terminators.clear()
                }
                _store.replaceEvents(events, cursor)
                if (_terminators.size === 0) {
                    processes.forEach(process =>
                        _terminators.add(process(store)),
                    )
                }
            },
        }

        processes.forEach(process => _terminators.add(process(store)))

        return store
    }
}

export interface Process<E> {
    (store: Store<E>): Unsubscribe
}
