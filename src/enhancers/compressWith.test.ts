import { createStore } from '..'
import { compressWith, StoreCompressor } from './compressWith'

describe(`${compressWith.name}`, () => {
    it(`should compress store on every interval`, () => {
        const events = new Array<number>()
        const compressor: StoreCompressor<number> = events => [...events, 1]

        let next = () => {}
        const fakeInterval: WindowOrWorkerGlobalScope['setInterval'] = (
            callback: TimerHandler,
            timeout?: number | undefined,
        ) => {
            if (typeof callback !== 'function') return 0
            let i = 0
            next = () => {
                i++
                if (i >= (timeout || 0)) {
                    callback()
                    i = 0
                }
            }
            return i
        }

        const store = createStore(events, [
            compressWith(compressor, 3, fakeInterval),
        ])

        expect(store.events().length).toBe(0)
        next()
        next()
        expect(store.events().length).toBe(0)
        next()
        expect(store.events().length).toBe(1)
    })

    it(`should keep original state if compressor returned undefined`, () => {
        const events = new Array<number>()
        const compressor: StoreCompressor<number> = events => undefined

        let next = () => {}
        const fakeInterval: WindowOrWorkerGlobalScope['setInterval'] = (
            callback: TimerHandler,
            timeout?: number | undefined,
        ) => {
            if (typeof callback !== 'function') return 0
            let i = 0
            next = () => {
                i++
                if (i >= (timeout || 0)) {
                    callback()
                    i = 0
                }
            }
            return i
        }

        const store = createStore(events, [
            compressWith(compressor, 3, fakeInterval),
        ])

        expect(store.events().length).toBe(0)
        next()
        next()
        expect(store.events().length).toBe(0)
        next()
        expect(store.events().length).toBe(0)
        expect(store.events()).toBe(events)
    })
})
