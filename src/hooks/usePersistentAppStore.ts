import { useAppStateStore } from "@/stores/useAppStateStore";
import { useCallback } from "react";

export function usePersistentAppStore<T>(
  instanceId: string,
  defaultState: T
): [T, (newState: Partial<T> | ((prevState: T) => Partial<T>)) => void] {
  const storedState = useAppStateStore(
    (s) => s.appStates[instanceId] as Partial<T>
  );

  const state: T = { ...defaultState, ...storedState };

  const setGlobalState = useAppStateStore((s) => s.setAppState);

  const setState = useCallback(
    (newState: Partial<T> | ((prevState: T) => Partial<T>)) => {
      if (typeof newState === "function") {
        setGlobalState(instanceId, newState(state));
      } else {
        setGlobalState(instanceId, newState);
      }
    },
    [instanceId, setGlobalState, state]
  );

  return [state, setState];
}
