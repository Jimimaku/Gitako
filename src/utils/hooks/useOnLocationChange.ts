import React, { useEffect } from 'react'
import { useLocation } from 'react-use'

export function useOnLocationChange(
  callback: React.EffectCallback,
  extraDeps: React.DependencyList = [],
) {
  const { href, pathname, search } = useLocation()
  useEffect(callback, [href, pathname, search, callback, ...extraDeps])
}
