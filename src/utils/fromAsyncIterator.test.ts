import { take, toArray } from 'rxjs/operators'
import { fromAsyncIterator } from './fromAsyncIterator'

describe(`${fromAsyncIterator.name}`, ()=> {
    it(`should convert async iterator to observable`, async ()=> {
        const source = [1, 2, 3, 4]
        async function* source_() {
            yield source[0]
            await Promise.resolve()
            yield source[1]
            yield source[2]
            await Promise.resolve()
            yield source[3]
        }
        const obs = fromAsyncIterator(source_())
        expect(await obs.pipe(take(3), toArray()).toPromise()).toEqual([1, 2, 3])
        expect(await obs.pipe(take(1), toArray()).toPromise()).toEqual([4])
    })

    it(`should share source iterator across all subscriptions`, async ()=> {
        const source = [1, 2, 3, 4]
        async function* source_() {
            yield source[0]
            await Promise.resolve()
            yield source[1]
            yield source[2]
            await Promise.resolve()
            yield source[3]
        }
        const obs1 = fromAsyncIterator(source_())
        const obs2 = fromAsyncIterator(source_())
        expect(await obs1.pipe(take(3), toArray()).toPromise()).toEqual([1, 2, 3])
        expect(await obs2.pipe(take(3), toArray()).toPromise()).toEqual([1, 2, 3])
    })
})