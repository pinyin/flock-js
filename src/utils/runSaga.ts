import { merge, Observable, OperatorFunction, Subject, Subscriber } from 'rxjs'
import { share } from 'rxjs/operators'

export function runSaga<I, O>(
    createSaga: SagaCreator<I, O>,
): OperatorFunction<I, O> {
    return (source: Observable<I>): Observable<O> => {
        return Observable.create((subscriber: Subscriber<O>) => {
            const terminate = new Subject<never>()

            const saga = createSaga(merge(source, terminate), terminate)

            async function receive() {
                try {
                    for await (const e of saga) {
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
                terminate.error(new SagaTerminated(createSaga.name))
            }
        }).pipe(share())
    }
}

export interface SagaCreator<I, O = I> {
    (source: Observable<I>, terminate: Observable<never>): Saga<O>
}

export interface Saga<O> extends AsyncIterableIterator<O> {}

export class SagaTerminated extends Error {
    constructor(sagaName?: string) {
        super(`Saga ${sagaName} is terminated by parent`)
    }
}
