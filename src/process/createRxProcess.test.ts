import { EMPTY, merge, Observable, OperatorFunction, Subject } from 'rxjs'
import { tap } from 'rxjs/operators'

import { attachProcess, createStore, GetState } from '..'
import { createRxProcess, RxProcessCreator } from './createRxProcess'

describe(`${createRxProcess.name}`, () => {
    it(`should initialize process with existing events`, () => {
        const receive = jest.fn()
        let count = 0
        const process: RxProcessCreator<number> = (
            getState: GetState<number>,
        ): OperatorFunction<number, number> => {
            count = getState<Array<number>>(collectEvents, e => [...e]).length
            return (obs: Observable<number>) =>
                obs.pipe(
                    () => EMPTY,
                    tap(receive),
                )
        }
        createStore<number>([1], [attachProcess(createRxProcess(process))])
        expect(receive).toBeCalledTimes(0)
        expect(count).toBe(1)
    })
    it(`should pass all events to process`, async () => {
        const taper = jest.fn()
        const subscriber = jest.fn()
        let count = 0
        const event$ = new Subject<number>()

        const process: RxProcessCreator<number> = (
            getState: GetState<number>,
        ): OperatorFunction<number, number> => {
            count = getState<Array<number>>(collectEvents, e => [...e]).length
            return (obs: Observable<number>) =>
                merge(obs.pipe(() => EMPTY), event$).pipe(tap(taper))
        }
        createStore<number>(
            [1],
            [attachProcess(createRxProcess(process))],
        ).subscribe(subscriber)

        event$.next(2)
        expect(count).toBe(1)
        expect(subscriber).toBeCalledTimes(1)
        expect(taper).toBeCalledTimes(1)
    })
    it(`should unsubscribe from observable before replaceEvents`, () => {
        const teardown = jest.fn()

        const process: RxProcessCreator<number> = (): OperatorFunction<
            number,
            number
        > => {
            return () => new Observable(() => teardown)
        }

        const store = createStore<number>(
            [],
            [attachProcess(createRxProcess(process))],
        )

        expect(teardown).toBeCalledTimes(0)
        store.replaceEvents([], 8)
        expect(teardown).toBeCalledTimes(1)
    })
})

function collectEvents<E>(prev: Array<E>, event: E): Array<E> {
    prev.push(event)
    return prev
}
