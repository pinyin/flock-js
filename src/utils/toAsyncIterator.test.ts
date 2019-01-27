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
