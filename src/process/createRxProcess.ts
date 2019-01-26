import { OperatorFunction, Subject, Subscription } from 'rxjs'
import { GetState, Process, Store } from '..'

export function createRxProcess<E>(
    createRxOperator: RxOperatorCreator<E>,
): Process<E> {
    return (store: Store<E>) => {
        const subscription = new Subscription()

        const store$ = new Subject<E>()
        let cursor = store.events.length

        subscription.add(
            store.subscribe(() => {
                const newCursor = store.events().length
                if (newCursor < 1 || newCursor === cursor) return
                cursor = newCursor
                const event = store.events()[newCursor - 1]
                store$.next(event)
            }),
        )
        subscription.add(
            store$
                .pipe(createRxOperator(store.getState))
                .subscribe(e => store.dispatch(e)),
        )

        return () => {
            store$.unsubscribe()
            subscription.unsubscribe()
        }
    }
}

export interface RxOperatorCreator<E> {
    (getState: GetState<E>): OperatorFunction<E, E>
}
