import { Observable, Subject } from 'rxjs'
import { shareReplay, toArray } from 'rxjs/operators'
import { Next, saga } from './saga'

describe(`${saga.name}`, () => {
    it(`should pass all messages to saga iff saga is subscribed`, async () => {
        const source = new Subject()
        const received = jest.fn()
        async function* count(
            source: Observable<any>,
            next: Next,
        ): AsyncIterableIterator<any> {
            while (true) {
                const value = await next(source)
                received(value)
            }
        }
        const destination = source.pipe(saga(count))
        source.next(1)
        await Promise.resolve()
        expect(received).toBeCalledTimes(0)
        const subscription = destination.subscribe()
        source.next(1)
        await Promise.resolve()
        expect(received).toBeCalledTimes(1)
        source.next(1)
        await Promise.resolve()
        expect(received).toBeCalledTimes(2)
        await Promise.resolve()
        subscription.unsubscribe()
        source.next(1)
        await Promise.resolve()
        expect(received).toBeCalledTimes(2)
    })

    it(`should convert events passed by saga to downstream observable`, async () => {
        const source = new Subject()
        async function* count(
            source: Observable<any>,
            next: Next,
        ): AsyncIterableIterator<any> {
            while (true) {
                const value = await next(source)
                if (value >= 3) return
                yield value * 2
            }
        }
        const destination = source.pipe(
            saga(count),
            toArray(),
            shareReplay(1),
        )
        const subscription = destination.subscribe()
        source.next(1)
        await Promise.resolve()
        await Promise.resolve()
        source.next(2)
        await Promise.resolve()
        await Promise.resolve()
        source.next(3)
        subscription.unsubscribe()
        await Promise.resolve()
        await Promise.resolve() // TODO refactor test logic
        expect(await destination.toPromise()).toEqual([2, 4])
    })
})
