import { Observable } from 'rxjs'
import { first } from 'rxjs/internal/operators/first'
import { tap } from 'rxjs/internal/operators/tap'
import { async } from 'rxjs/internal/scheduler/async'
import { observeOn, share } from 'rxjs/operators'

export async function* toAsyncIterableIterator<T>(
    source: Observable<T>,
): AsyncIterableIterator<T> {
    let cache = new Array<T>()
    const sharedSource = source.pipe(
        tap(v => cache.push(v)),
        observeOn(async),
        share(),
    )
    const sharingSource = sharedSource.subscribe()
    const hasNext = async () =>
        (await sharedSource.pipe(first(null, NONE)).toPromise()) !== NONE
    do {
        yield* cache
        cache = []
    } while (await hasNext())
    sharingSource.unsubscribe()
}

const NONE = Symbol('NONE')
