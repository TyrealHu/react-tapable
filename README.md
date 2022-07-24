# react-tapable [![npm version](https://img.shields.io/npm/v/react-tapable.svg?style=flat)](https://www.npmjs.com/package/react-tapable)[![Node.js CI](https://github.com/TyrealHu/react-tapable/actions/workflows/nodejs.yml/badge.svg?branch=main)](https://github.com/TyrealHu/react-tapable/actions/workflows/nodejs.yml)[![Coverage Status](https://codecov.io/gh/TyrealHu/react-tapable/branch/master/graph/badge.svg)](https://codecov.io/gh/TyrealHu/react-tapable)

Module of React subscription and Distribution based on [tapable](https://github.com/webpack/tapable)

We have added two specific hooks to solve different situations, as detailed in [here](./doc/HOOKS.CN.md)

## Quick Start

You can use this module in the following ways

```typescript
import createTapableController, {SyncHook} from 'react-tapable'

const {
    HooksNameMap,
    tapHook,
    call,
    callAsync,
    promise,
    useTapable,
    removeTapHook
} = createTapableController<{ testOne: string; testTwo: string }>(
    'Test',
    {
        testOne: new SyncHook([]),
        testTwo: new SyncHook([])
    }
)
```

### React Hooks + useTapable

You can subscribe by directly using `useTapable` in the React Functional Component .

You can use `state` in `fn of useTapable`, and the registered function will automatically uninstall and re-listen according to the changes in the incoming `state`, without worrying about memory leaks.

```tsx
// import this function from the file where you called createTapableController
import {useTapable, HooksNameMap} from './tapable'
import * as React from 'react'
import {useState} from 'react'

const Component = () => {
    const [count, setCount] = useState<number>(1)
    useTapable(
        {
            hook: HooksNameMap.XXX,
            mode: 'tap'
        },
        () => {
            console.log(count)
        },
        [count]
    )

    return (<div>Hello React Tapable</div>)
}
```

### React Component + tapHook + removeTapHook

You can subscribe by directly using `tapHook` in the React Component.

You can use `state` in `fn of tapHook` to registering function , and uninstall the function by `removeTapHook`.

```tsx
// import this function from the file where you called createTapableController
import {tapHook, removeTapHook, HooksNameMap} from './tapable'
import * as React from 'react'

export class Component extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            count: 1
        }
        
        this.fn = () => {
            console.log(this.state.count)
        }
        
        tapHook({
            hook: HooksNameMap.XXX,
            mode: 'tap'
        }, this.fn)
    }
    
    componentWillUnMount() {
        removeTapHook(HooksNameMap.XXX, 'tap', this.fn)
    }
}
```

## Method introduction

### `HooksNameMap`

This map stores the names of all the hooks you have registered, and it can be used when you register the event
```tsx
createTapableController<{ testOne: string; testTwo: string }>(
    'Test',
    {
        testOne: new SyncHook([]),
        testTwo: new SyncHook([])
    }
)
```

For example, in the case of the above, it will be `{testOne: 'testOne', testTwo: 'testTwo'}`

### `call | callAsync | promise`

These three methods are used to trigger listening events.

### `tapHook | removeTapHook`

These two methods are used to register events and uninstall events in React.Component

### `useTapable`

This method is used to register events in react hooks
