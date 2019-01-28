import { OperatorFunction, Subject, Subscription } from 'rxjs'
import { GetState, Process, Store } from '..'

export function createRxProcess<E>(rxProcess: RxProcessCreator<E>): Process<E> {
    return (store: Store<E>) => {
        function reducer(prev: any, event: E) {
            return event
        }
        function getLatestEvent() {
            return store.getState(reducer, events =>
                events.reduce<E | typeof EMPTY>(reducer, EMPTY),
            )
        }

        const subscription = new Subscription()

        const store$ = new Subject<E>()

        subscription.add(store$)
        subscription.add(
            store.subscribe(() => {
                const event = getLatestEvent()
                if(event === EMPTY) return
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
        }
    }
}

export interface RxProcessCreator<E> {
    (getState: GetState<E>): OperatorFunction<E, E>
}

const EMPTY= Symbol('EMPTY')
