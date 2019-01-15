import { OperatorFunction, Subject, Subscription } from 'rxjs'
import { GetState, Process, Store } from '..'

export function createRxProcess<E>(
    rxProcess: RxOperatorFactory<E>,
): Process<E> {
    return (store: Store<E>) => {
        const subscription = new Subscription()

        const store$ = new Subject<E>()

        subscription.add(
            store.subscribe(() => {
                if (store.events().length < 1) return
                const event = store.events()[store.events().length - 1]
                store$.next(event)
            }),
        )
        subscription.add(
            store$
                .pipe(rxProcess(store.getState))
                .subscribe(e => store.dispatch(e)),
        )

        return () => {
            subscription.unsubscribe()
            store$.unsubscribe()
        }
    }
}

export interface RxOperatorFactory<E> {
    (getState: GetState<E>): OperatorFunction<E, E>
}
