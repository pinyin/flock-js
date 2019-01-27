import { merge, Observable, OperatorFunction, Subject, Subscriber } from 'rxjs'
import { share } from 'rxjs/operators'

export function withUseCase<I, O>(
    createUseCase: UseCaseCreator<I, O>,
): OperatorFunction<I, O> {
    return (source: Observable<I>): Observable<O> => {
        return Observable.create((subscriber: Subscriber<O>) => {
            const terminate = new Subject<never>()

            const useCase = createUseCase(merge(source, terminate), terminate)

            async function receive() {
                try {
                    for await (const e of useCase) {
                        if (terminate.hasError) break
                        subscriber.next(e)
                    }
                    subscriber.complete()
                } catch (e) {
                    if (e instanceof UseCaseTerminated) return
                    subscriber.error(e)
                }
            }

            receive()

            return () => {
                terminate.error(new UseCaseTerminated(createUseCase.name))
            }
        }).pipe(share())
    }
}

export interface UseCaseCreator<I, O = I> {
    (source: Observable<I>, terminate: Observable<never>): UseCase<O>
}

export interface UseCase<O> extends AsyncIterableIterator<O> {}

export class UseCaseTerminated extends Error {
    constructor(useCaseName?: string) {
        super(`UseCase ${useCaseName} is terminated by parent`)
    }
}
