import { Dispatch, SetStateAction, useState } from 'react';

/**
 * This hook creates a synchronized state while avoiding the cascading update issue.
 * In our case, synchronized means that when there is a change in propsState,
 * the returned state changes to the same value,
 * but it can also change independently when the returned setState is called.
 * @param propsState - a reactive value (e.g. state, props) with which our returned state will synchronize
 * @return the exact same output as useState: [state, setState], where state is the synchronized state with the propsState
 */
export function useSyncState<T>(propsState: T): [T, Dispatch<SetStateAction<T>>] {
    const [prevProps, setPrevProps] = useState(propsState);
    const [currentState, setCurrentState] = useState(propsState);

    let resultState = currentState;

    if (prevProps !== propsState) {
        resultState = propsState;
        setPrevProps(propsState);
        setCurrentState(propsState);
    }

    return [resultState, setCurrentState];
}