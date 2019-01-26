import * as React from 'react'
import { ReactNode, Reducer } from 'react'
import { Initializer, Store, Unsubscribe } from '..'

// TODO reuse hook API after React hooks is officially released
export class StoreBuilder<S, E> extends React.Component<
    StoreBuilderProps<S, E>,
    { store: S }
> {
    constructor(props: StoreBuilderProps<S, E>) {
        super(props)
        this.state = {
            store: props.store.getState(props.reducer, props.initializer),
        }
        this.unsubscribe = () => {}
    }

    componentDidMount(): void {
        this.unsubscribe = this.props.store.subscribe(() =>
            this.updateIfNecessary(),
        )
    }

    updateIfNecessary(): void {
        const nextStoreState = this.props.store.getState(
            this.props.reducer,
            this.props.initializer,
        )
        if (nextStoreState !== this.state.store)
            this.setState({ store: nextStoreState })
    }

    render() {
        return this.props.children(this.state.store)
    }

    componentDidUpdate(
        prevProps: Readonly<StoreBuilderProps<S, E>>,
        prevState: Readonly<{ store: S }>,
    ): void {
        const shouldRecalculateState =
            prevProps.store !== this.props.store ||
            prevProps.reducer !== this.props.reducer
        if (shouldRecalculateState) {
            this.unsubscribe()
            this.unsubscribe = this.props.store.subscribe(() =>
                this.updateIfNecessary(),
            )
            this.updateIfNecessary()
        }
    }

    componentWillMount(): void {
        this.unsubscribe()
    }

    private unsubscribe: Unsubscribe
}

export type StoreBuilderProps<S, E> = {
    store: Store<E>
    reducer: Reducer<S, E>
    initializer: Initializer<S, E>
    children: (state: S) => ReactNode
}
