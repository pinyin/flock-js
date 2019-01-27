import { from } from 'rxjs/internal/observable/from'
import { toAsyncIterableIterator } from './toAsyncIterableIterator'

describe(`${toAsyncIterableIterator.name}`, () => {
    it(`should convert observable to async iterator`, async () => {
        const source = [1, 2, 3, 4]
        const iterable = toAsyncIterableIterator(from(source))
        const result = []
        for await (const value of iterable) {
            result.push(value)
        }
        expect(result).toEqual(source)
    })

    it(`should not lose emitted value`, async () => {
        const source = [1, 2, 3, 4]
        const iterable = toAsyncIterableIterator(from(source))
        const result = []
        for await (const value of iterable) {
            await new Promise(r => setTimeout(r, 10))
            result.push(value)
        }
        expect(result).toEqual(source)
    })

    it(`should skip previous value in realtime mode`, async () => {
        const source = [1, 2, 3, 4]
        const iterable = toAsyncIterableIterator(from(source), true)
        const result = []
        for await (const value of iterable) {
            await new Promise(r => setTimeout(r, 10))
            result.push(value)
        }
        expect(result).toEqual([4])
    })
})
