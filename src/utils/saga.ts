import { merge, Observable, OperatorFunction, Subject, Subscriber } from 'rxjs'
import { first } from 'rxjs/operators'

export function saga<I, O>(saga: SagaCreator<I, O>): OperatorFunction<I, O> {
    return (source: Observable<I>): Observable<O> => {
        return Observable.create((subscriber: Subscriber<O>) => {
            const terminate = new Subject<any>()

            async function next<T>(from: Observable<T>): Promise<T> {
                return merge(from, terminate)
                    .pipe(first())
                    .toPromise()
            }

            const iterable = saga(merge(source, terminate), next)

            async function receive() {
                try {
                    for await (const e of iterable) {
                        if (terminate.hasError) break
                        subscriber.next(e)
                    }
                    subscriber.complete()
                } catch (e) {
                    if (e instanceof SagaTerminated) return
                    subscriber.error(e)
                }
            }

            receive()

            return () => {
                terminate.error(new SagaTerminated(saga.name))
            }
        })
    }
}

export interface SagaCreator<I, O = I> {
    (source: Observable<I>, next: Next): AsyncIterableIterator<O>
}

export interface Next {
    <E>(from: Observable<E>): Promise<E>
}

export class SagaTerminated extends Error {
    constructor(sagaName?: string) {
        super(`Saga ${sagaName} is terminated by parent`)
    }
}
