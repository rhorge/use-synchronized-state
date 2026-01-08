import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';

/**
 * This hook creates a synchronized state while avoiding the cascading update issue.
 * In our case, synchronized means that when there is a change in propsState,
 * the returned state changes to the same value,
 * but it can also change independently when the returned setState is called.
 * @param propsState - a reactive value (e.g. state, props) with which our returned state will synchronize
 * Returns the exact same output as useState: [state, setState], where state is the synchronized state with the propsState
 */
export function useSyncState<T>(propsState: T): [T, Dispatch<SetStateAction<T>>] {
    const [, setRender] = useState(true);
    const currentStateRef = useRef(propsState);

    const prevStateRef = useRef(propsState);

    if (prevStateRef.current !== propsState) {
        prevStateRef.current = propsState;
        currentStateRef.current = propsState;
    }


    const setOptimisticState = useCallback(
        (newState: SetStateAction<T>) => {
            const oldState = currentStateRef.current;
            currentStateRef.current = newState instanceof Function ? newState(currentStateRef.current) : newState;

            if(oldState !== currentStateRef.current) {
                setRender(prev => !prev);
            }
        },
        [currentStateRef]
    );

    return [currentStateRef.current, setOptimisticState];
}