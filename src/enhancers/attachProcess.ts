import {
    Store,
    StoreCreator,
    StoreEnhancer,
    StoreForEnhancer,
    Subscriber,
    Unsubscribe,
} from '../types'

export function attachProcess<E>(...processes: Process<E>[]): StoreEnhancer<E> {
    return (inner: StoreCreator<E>) => (
        prepublish: Array<E>,
    ): StoreForEnhancer<E> => {
        const _terminators = new Set()

        const _listeners = new Set<Subscriber>()
        const innerStore = inner(prepublish)

        const store: StoreForEnhancer<E> = {
            ...innerStore,
            subscribe(subscriber: Subscriber) {
                _listeners.add(subscriber)
                return () => _listeners.delete(subscriber)
            },
            replaceEvents: (events: Array<E>, cursor: number): void => {
                _terminators.forEach(terminate => terminate()) // TODO try-catch
                _terminators.clear()
                innerStore.replaceEvents(events, cursor)
                processes.forEach(process => _terminators.add(process(store)))
            },
            dispatch: (event: E) => {
                innerStore.dispatch(event)
                _listeners.forEach(it => it()) // TODO try-catch
            },
        }

        processes.forEach(process => _terminators.add(process(store)))

        return store
    }
}

export interface Process<E> {
    (store: Store<E>): Unsubscribe
}
