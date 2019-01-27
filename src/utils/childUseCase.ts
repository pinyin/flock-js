import { Observable, Subject } from 'rxjs'
import { first } from 'rxjs/internal/operators/first'
import { tap } from 'rxjs/internal/operators/tap'
import { async } from 'rxjs/internal/scheduler/async'
import { observeOn, publish, share, shareReplay } from 'rxjs/operators'

const NONE = Symbol('NONE')
export async function* childUseCase<T>(
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
        console.log(cache)
        yield* cache
        cache = []
    } while (await hasNext())
    sharingSource.unsubscribe()
}
