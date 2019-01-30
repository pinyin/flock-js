import { take, toArray } from 'rxjs/operators'
import { fromAsyncIterator } from './fromAsyncIterator'

describe(`${fromAsyncIterator.name}`, () => {
    it(`should convert async iterator to observable`, async () => {
        const source = [1, 2, 3, 4]

        async function* source_() {
            yield source[0]
            await Promise.resolve()
            yield source[1]
            yield source[2]
            await Promise.resolve()
            yield source[3]
        }

        const obs = fromAsyncIterator(source_(), true)
        expect(
            await obs
                .pipe(
                    take(3),
                    toArray(),
                )
                .toPromise(),
        ).toEqual([1, 2, 3])
        expect(
            await obs
                .pipe(
                    take(1),
                    toArray(),
                )
                .toPromise(),
        ).toEqual([])

        const obs2 = fromAsyncIterator(source_())
        expect(
            await obs2
                .pipe(
                    take(3),
                    toArray(),
                )
                .toPromise(),
        ).toEqual([1, 2, 3])
        expect(
            await obs2
                .pipe(
                    take(1),
                    toArray(),
                )
                .toPromise(),
        ).toEqual([4])
    })

    it(`should share iterator across concurrent subscriptions`, async () => {
        const source = [1, 2, 3, 4]

        async function* source_() {
            yield source[0]
            await Promise.resolve()
            yield source[1]
            yield source[2]
            await Promise.resolve()
            yield source[3]
        }

        const iterator = source_()
        const obs = fromAsyncIterator(iterator)
        const r1 = obs
            .pipe(
                take(3),
                toArray(),
            )
            .toPromise()
        const r2 = obs
            .pipe(
                take(3),
                toArray(),
            )
            .toPromise()
        expect(await r1).toEqual([1, 2, 3])
        expect(await r2).toEqual([1, 2, 3])
    })
})
