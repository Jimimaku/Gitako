import React, { useContext } from 'react'

export function useLoadedContext<T>(context: React.Context<T | null>): T {
  const ctx = useContext(context)
  if (ctx === null) throw new Error(`Context not loaded`)
  return ctx
}
