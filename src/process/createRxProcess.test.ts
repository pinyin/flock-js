import { EMPTY, merge, Observable, OperatorFunction, Subject } from 'rxjs'
import { tap } from 'rxjs/operators'

import { TestScheduler } from 'rxjs/testing'
import { attachProcess, createStore, GetState, INIT } from '..'
import { createRxProcess, RxOperatorFactory } from './createRxProcess'

const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
})

describe(`${createRxProcess.name}`, () => {
    it(`should initialize process with existing events`, () => {
        const receive = jest.fn()
        let count = 0
        const process: RxOperatorFactory<number> = (
            getState: GetState<number>,
        ): OperatorFunction<number, number> => {
            count = getState<Array<number>>(collectEvents).length
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
        const receive = jest.fn(e => console.log(e))
        const subscriber = jest.fn()
        let count = 0
        const event$ = new Subject<number>()

        const process: RxOperatorFactory<number> = (
            getState: GetState<number>,
        ): OperatorFunction<number, number> => {
            count = getState<Array<number>>(collectEvents).length
            return (obs: Observable<number>) =>
                merge(obs.pipe(() => EMPTY), event$).pipe(tap(receive))
        }
        createStore<number>(
            [1],
            [attachProcess(createRxProcess(process))],
        ).subscribe(subscriber)

        event$.next(2)
        expect(count).toBe(1)
        expect(subscriber).toBeCalledTimes(1)
        expect(receive).toBeCalledTimes(1)
    })
    it(`should terminate process after unsubscribe`, () => {})
})

function collectEvents<E>(
    prev: Array<E> | undefined,
    event: E | typeof INIT,
): Array<E> {
    const next = prev || []
    if (event !== INIT) next.push(event)
    return next
}
