import { Observable, OperatorFunction } from 'rxjs'
import { createRxProcess, fromAsyncIterator, GetState, Process } from '..'

export function createUseCase<E>(useCase: UseCase<E>): Process<E> {
    return createRxProcess(
        (getState: GetState<E>): OperatorFunction<E, E> => {
            return (source: Observable<E>) =>
                source.pipe(source =>
                    fromAsyncIterator(useCase(source, getState)),
                )
        },
    )
}

export interface UseCase<E> {
    (inputs: Observable<E>, getState: GetState<E>): AsyncIterableIterator<E>
}
