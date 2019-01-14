import { Reducer } from 'react'
import { OperatorFunction, Subject, Subscription } from 'rxjs'
import { GetState, Process, Store } from '..'

export function createRxProcess<E>(
    rxProcess: RxOperatorFactory<E>,
): Process<E> {
    return (store: Store<E>) => {
        const subscription = new Subscription()

        const store$ = new Subject<E>()

        const INIT = Symbol('init')
        type INIT = typeof INIT
        const lastEvent: Reducer<E | INIT, E | INIT> = (_, e) => e

        subscription.add(
            store.subscribe(() => {
                const event = store.getState(lastEvent, () => INIT as E | INIT)

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

        return () => {
            subscription.unsubscribe()
            store$.unsubscribe()
        }
    }
}

export interface RxOperatorFactory<E> {
    (getState: GetState<E>): OperatorFunction<E, E>
}
