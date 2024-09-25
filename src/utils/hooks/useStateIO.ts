import React, { useMemo, useState } from 'react'

export function useStateIO<S>(initialState: S | (() => S)): {
  value: S
  onChange: React.Dispatch<React.SetStateAction<S>>
} {
  const [value, onChange] = useState(initialState)
  return useMemo(() => ({ value, onChange }), [value])
}
