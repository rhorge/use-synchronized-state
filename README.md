# A React hook that creates a synchronized state with a reactive value (fixing the Cascading updates issue)

## Highlights
- Offers a hook called useSyncState
- Removes the cascading update problem
- Same API as useState
- No extra dependencies
- Written in React with Typescript
- Typescript support
- Small bundle size

## Install

```sh
    yarn add use-synchronized-state
```
or
```sh
    npm install use-synchronized-state
```

## Usage

### Synchronize state with prop

```typescript jsx
import { useState } from 'react';

function ParentComponent() {
  const [parentState, setParentState] = useState(0);

  return (
    <div>
      <button onClick={() => {setParentState(prev => prev + 1);}}>
        increment parentState
      </button>
      <div>parentState = {parentState}</div>
      <ChildComponent parentState={parentState} />
    </div>
  );
}

import { useSyncState } from 'use-synchronized-state';

function ChildComponent({ parentState }: { parentState: number }) {
  // this syncState is synchronized with parentState (has the same api as useState)
  const [syncState, setSyncState] = useSyncState(parentState);
  
  return (
    <div>
      <button onClick={() => {setSyncState(prev => prev + 1);}}>
        increment syncState
      </button>
      <div>syncState = {syncState}</div>
    </div>
  );
}
```

### Synchronize state with memoized value

```typescript jsx
import { useMemo } from 'react';
import { useSyncState } from 'use-synchronized-state';

function ChildComponent({ parentState }: { parentState: number }) {
  // compute a value based on parentState
  const complexState = useMemo(() => parentState + 1, [parentState]);
  
  // this syncState is synchronized with complexState (has the same api as useState)
  const [syncState, setSyncState] = useSyncState(complexState);

  return (
    <div>
      <button onClick={() => {setSyncState(prev => prev + 1);}}>
        increment syncState
      </button>
      <div>syncState = {syncState}</div> 
    </div>
  );
}
```

## Description
This hook creates a synchronized state while avoiding the cascading updates issue.
In our case, synchronized means:
- When there is a change in the reactive value that we synchronize our state with,
the returned state changes to the same value, but it can also change independently when the returned setState is called.


### Let's see a small example

```typescript jsx
import { useState } from 'react';

function ParentComponent() {
  const [parentState, setParentState] = useState(0);
  
  return (
    <ChildComponent parentState={parentState} />
  );
}

function ChildComponent({ parentState }: { parentState: number }) {
  const [unsyncState, setUnsyncState] = useState(parentState);
  // ...
}
```

In the above example, we have a simple component structure: a parent component that renders a child component
(passing its state as props).

When the child component mounts (is rendered for the first time), the unsyncState state has the same
value as the parentState prop (or the parentState state, which is passed as a prop).

Now if the parentState changes (by calling its setParentState setter), the parentState prop will change accordingly,
but the value of the unsyncState will not (because the state is only initialized when the component mounts).

What can we do in the following situation?

The first thing that comes to mind is to do something like this:

```typescript jsx
function ChildComponent({ parentState }: { parentState: number }) {
  const [syncState, setSyncState] = useState(parentState);

  useEffect(() => {
    setSyncState(parentState)
  }, [parentState]);
  // ...
}
```

This is doing its job, but we now have another problem called "cascading updates" (which will be spotted by the
React Performance tracks). You can read the docs at the following link
https://react.dev/reference/dev-tools/react-performance-tracks#cascading-updates.

To explain why this happens, we first have to know that React Fiber algorithm has two phases: the render phase and
the commit phase. All you need to know, to understand the issue, is that React will call useEffect after the entire
virtual dom is rendered.

So, in our case, after the first render will complete parentState and syncState will have both the value 0
(the initial value of parentState). Setting parentState to a new value (let's say 1), React will render the
ChildComponent with the parentState props as 1, but the syncState will still have the previous value 0.
Once the useEffect runs (setting the syncState to 1), we will have another render that has both values equal to 1.
This is the cascading updates problem in all its glory, instead of having one render, you ended up having two
(having also a performance penalty).


What react docs tell us to do in this case can be found here
https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
The above example was changed to match the docs. It still rerenders the ChildComponent twice, which still causes a smaller
performance penalty, is hard to reason about and works only for states defined in the same component
(if syncState was a prop, it wouldn't work). Also, the parentState and syncState will be synchronized only starting with
the second render.

```typescript jsx
function ChildComponent({ parentState }: { parentState: number }) {
  const [syncState, setSyncState] = useState(parentState);

  // Better: Adjust the state while rendering
  const [prevState, setPrevState] = useState(parentState);
  if (parentState !== prevState) {
    setPrevState(parentState);
    setSyncState(parentState);
  }
  // ...
}
```

The 'use-synchronized-state' hook solves the synchronization problem in an easier and more consistent manner.
Also, the api is easy to use and it works for any reactive value.


```typescript jsx
import { useSyncState } from 'use-synchronized-state';

function ChildComponent({ parentState }: { parentState: number }) {
  const [syncState, setSyncState] = useSyncState(parentState);
  // ...
}
```

## License
MIT