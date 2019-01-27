# flock-js

Coordinate React components' states with event sourcing.

Inspired by [Redux](https://redux.js.org).

## Usage

In your React component, replace all `useReducer` with `useStoreReducer`:

```js
import { useContextStoreReducer, StoreContext } from 'flock-js'
const store = createStore()

// then update your code
// from
const [state, dispatch] = useReducer(reducer, initialState)
// to
const [state, dispatch] = useStoreReducer(store, reducer, (actions) => /* compute initialState from actions */)
```

Components will then be able to consume each other's actions.

See test files in src/react for more information.

More functions on the way.
