import { useEffect, useMemo } from 'react'

export function useEffectOnSerializableUpdates<T>(
  value: T,
  serialize: (value: T) => string,
  onChange: (value: T) => void,
) {
  const serialized = useMemo(() => serialize(value), [value, serialize])
  useEffect(() => onChange(value), [onChange, serialized]) // eslint-disable-line react-hooks/exhaustive-deps
}
