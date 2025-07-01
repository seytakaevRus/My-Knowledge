## 1

```ts
type TimerType = ReturnType<typeof setTimeout>;

export const useDebounce = <ArgumentsType extends unknown[], ReturnType extends unknown>(callback: (...args: ArgumentsType) => ReturnType, timeToWaitInMs: number) => {
  const timerIdRef = useRef<TimerType | null>(null);

  const debouncedCallback = (...args: ArgumentsType) => {
    if (timerIdRef.current != null) {
      clearTimeout(timerIdRef.current);
    }

    const timerId = setTimeout(() => {
      return callback(...args);
    }, timeToWaitInMs);

    timerIdRef.current = timerId;
  }

  useEffect(() => {
    return () => {
      if (timerIdRef.current != null) {
        clearTimeout(timerIdRef.current);
      }
    }
  }, []);

  return debouncedCallback;
};
```

## 2

```ts
export const useDebounce = <ArgumentsType extends unknown[], ReturnType extends unknown>(callback: (...args: ArgumentsType) => ReturnType, timeToWaitInMs: number) => {
  const timerIdRef = useRef<TimerType | null>(null);

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const clearTimer = () => {
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
  };

  const debouncedCallback = useCallback(
    (...args: ArgumentsType) => {
      clearTimer();
      timerIdRef.current = setTimeout(() => {
        return callbackRef.current(...args);
      }, timeToWaitInMs);
    },
    [timeToWaitInMs],
  );

  useEffect(() => {
    return clearTimer;
  }, []);

  return debouncedCallback;
};
```