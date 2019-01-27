import { Subject } from 'rxjs'
import { from } from 'rxjs/internal/observable/from'
import { toAsyncIterator } from './toAsyncIterator'

describe(`${toAsyncIterator.name}`, () => {
    it(`should convert observable to async iterator`, async () => {
        const source = [1, 2, 3, 4]
        const iterable = toAsyncIterator(from(source))
        const result = []
        for await (const value of iterable) {
            result.push(value)
        }
        expect(result).toEqual(source)
    })

    it(`should not lose emitted value`, async () => {
        const source = [1, 2, 3, 4]
        const iterable = toAsyncIterator(from(source))
        const result = []
        for await (const value of iterable) {
            await new Promise(r => setTimeout(r, 10))
            result.push(value)
        }
        expect(result).toEqual(source)
    })

    it(`should await incoming events`, async () => {
        const source = new Subject<number>()
        const iterable = toAsyncIterator(source)
        const result = new Array<number>()
        ;(async () => {
            for await (const value of iterable) {
                await new Promise(r => setTimeout(r, 10))
                result.push(value)
            }
        })()
        source.next(1)
        source.next(2)
        source.next(3)
        await new Promise(r => setTimeout(r, 100))
        expect(result).toEqual([1, 2, 3])
    })

    it(`should skip previous value in realtime mode`, async () => {
        const source = [1, 2, 3, 4]
        const iterable = toAsyncIterator(from(source), true)
        const result = []
        for await (const value of iterable) {
            await new Promise(r => setTimeout(r, 10))
            result.push(value)
        }
        expect(result).toEqual([4])
    })
})
