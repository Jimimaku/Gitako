import { useState } from 'react'

export function useConditionalHook<T>(condition: () => boolean, hook: () => T) {
  const [use] = useState(condition)
  if (use) return hook()
}
