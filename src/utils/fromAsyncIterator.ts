import { Observable, Subscriber } from 'rxjs'

export function fromAsyncIterator<T>(
    source: AsyncIterator<T>,
    returnOnUnsubscribe: boolean = true,
): Observable<T> {
    const subscribers = new Set<Subscriber<T>>()
    function startForwardingTo(ref: Subscriber<T>) {
        subscribers.add(ref)
        if (subscribers.size === 1) startForwarding()
    }
    function stopForwardingTo(ref: Subscriber<T>) {
        subscribers.delete(ref)
        if (
            returnOnUnsubscribe &&
            subscribers.size === 0 &&
            typeof source.return === 'function'
        )
            source.return()
    }

    async function startForwarding() {
        try {
            for (
                let next = await source.next();
                !next.done;
                next = await source.next()
            ) {
                for (const s of subscribers) {
                    s.next(next.value)
                }
            }
            for (const s of subscribers) {
                s.complete()
            }
        } catch (e) {
            for (const s of subscribers) {
                s.error(e)
            }
        } finally {
            if (typeof source.return === 'function') source.return()
        }
    }

    return Observable.create((subscriber: Subscriber<T>) => {
        const ref = new Subscriber(subscriber)
        startForwardingTo(ref)
        return () => {
            stopForwardingTo(ref)
        }
    })
}
