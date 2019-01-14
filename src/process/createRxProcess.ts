import { Reducer } from 'react'
import { OperatorFunction, Subject, Subscription } from 'rxjs'
import { GetState, INIT, Process, Store } from '..'

export function createRxProcess<E>(
    rxProcess: RxOperatorFactory<E>,
): Process<E> {
    return (store: Store<E>) => {
        const subscription = new Subscription()

        const store$ = new Subject<E>()
        const lastEvent: Reducer<E | INIT, E | INIT> = (_, e) => e

        subscription.add(
            store.subscribe(() => {
                const event = store.getState(lastEvent, events =>
                    events.length === 0 ? INIT : events[events.length - 1],
                )

                if (event !== INIT) {
                    store$.next(event)
                }
            }),
        )
        subscription.add(
            store$
                .pipe(rxProcess(store.getState))
                .subscribe(e => store.dispatch(e)),
        )
        store$.subscribe(e => console.log(e))

        return () => {
            subscription.unsubscribe()
            store$.unsubscribe()
        }
    }
}

export interface RxOperatorFactory<E> {
    (getState: GetState<E>): OperatorFunction<E, E>
}
