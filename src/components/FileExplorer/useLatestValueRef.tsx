import { useCallback, useEffect, useRef } from 'react'

function useLatestValueRef<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
export function useCallbackRef<Args extends AnyArray, R>(
  callback: (...args: Args) => R,
): (...args: Args) => R {
  const ref = useLatestValueRef(callback)
  return useCallback((...args: Args) => ref.current(...args), [ref])
}
