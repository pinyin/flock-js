# flock-js

Coordinate React components' states with event sourcing.

Inspired by [Redux](https://redux.js.org).

## Usage

In your React component, replace all `useReducer` with `useContextReducer`:

```js
import { useContextReducer } from 'flock-js'

// from
const [state, dispatch] = useReducer(reducer, initialState)
// to
const [state, dispatch] = useContextReducer(reducer, () => initialState)
```

Components will then be able to consume each other's actions.

See test files in src/react for more information.

More functions on the way.
