import { Observable } from 'rxjs'
import { first } from 'rxjs/internal/operators/first'
import { async } from 'rxjs/internal/scheduler/async'
import { observeOn, share } from 'rxjs/operators'

export async function* toAsyncIterableIterator<T>(
    source: Observable<T>,
): AsyncIterableIterator<T> {
    const sharedSource = source.pipe(
        observeOn(async),
        share(),
    )
    const sharingSource = sharedSource.subscribe()
    const getNext = () => sharedSource.pipe(first(null, NONE)).toPromise()
    try {
        for (let v = await getNext(); v !== NONE; v = await getNext()) {
            yield v
        }
    } finally {
        sharingSource.unsubscribe()
    }
}

const NONE = Symbol('NONE')
