import { StoreCreator, StoreEnhancer, StoreForEnhancer } from '../base/types'

const _setInterval = setInterval

export function compressWith<E>(
    compressor: StoreCompressor<E>,
    interval: number = 60000,
    setInterval: WindowOrWorkerGlobalScope['setInterval'] = _setInterval,
): StoreEnhancer<E> {
    return (inner: StoreCreator<E>): StoreCreator<E> => {
        return (prepublish: Array<E>): StoreForEnhancer<E> => {
            const _store = inner(prepublish)

            function compress() {
                const next = compressor(_store.events())
                if (typeof next === 'undefined') return
                _store.replaceEvents(next)
            }

            setInterval(compress, interval)

            return {
                ..._store,
            }
        }
    }
}

export interface StoreCompressor<E> {
    (events: ReadonlyArray<E>): Array<E> | undefined
}
