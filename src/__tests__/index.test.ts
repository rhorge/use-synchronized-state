import { renderHook, act } from '@testing-library/react-hooks';
import { useState } from "react";
import { useSyncState } from "../index";

test('sync states', () => {
    const { result } = renderHook(() => {
        const [state, setState] = useState(0);

        const [syncState, setSyncState] = useSyncState(state);

        return {state, syncState, setState, setSyncState};
    });

    expect(result.current.state).toBe(0);
    expect(result.current.syncState).toBe(0);

    act(() => result.current.setState(1));
    expect(result.current.state).toBe(1);
    expect(result.current.syncState).toBe(1);

    act(() => result.current.setSyncState(2));
    expect(result.current.state).toBe(1);
    expect(result.current.syncState).toBe(2);

    act(() => result.current.setSyncState(3));
    expect(result.current.state).toBe(1);
    expect(result.current.syncState).toBe(3);

    act(() => result.current.setState(2));
    expect(result.current.state).toBe(2);
    expect(result.current.syncState).toBe(2);

    act(() => result.current.setSyncState(3));
    expect(result.current.state).toBe(2);
    expect(result.current.syncState).toBe(3);
});