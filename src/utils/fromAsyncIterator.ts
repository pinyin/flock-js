import { Observable, Subscriber } from 'rxjs'

export function fromAsyncIterator<T>(source: AsyncIterator<T>): Observable<T> {
    let next = source.next()

    return Observable.create((subscriber: Subscriber<T>) => {
        let unsubscribed:boolean = false

        async function receive() {
            try {
                for (; !(await next).done && !unsubscribed; next = source.next()) {
                    subscriber.next((await next).value)
                }
                subscriber.complete()
            } catch (e) {
                subscriber.error(e)
            }
        }

        receive()

        return () => {
            unsubscribed = true
        }
    })
}
