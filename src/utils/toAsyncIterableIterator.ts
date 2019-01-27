import { Observable } from 'rxjs'

export async function* toAsyncIterableIterator<T>(
    source: Observable<T>,
    realtime: boolean = false,
): AsyncIterableIterator<T> {
    const cache = new Array<T>()
    let next = () => {}
    let error = (error: Error) => {}
    let isCompleted = false
    const sharingSource = source.subscribe(
        v => {
            if (realtime) cache.pop()
            cache.push(v)
            next()
        },
        e => error(e),
        () => (isCompleted = true),
    )
    const untilNext = (): Promise<boolean> =>
        new Promise((resolve, reject) => {
            next = resolve
            error = reject
        })
    try {
        do {
            while (cache.length > 0) {
                yield cache.shift()!
            }
        } while (!isCompleted && (await untilNext()))
    } finally {
        sharingSource.unsubscribe()
    }
}

