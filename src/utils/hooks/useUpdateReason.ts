import { IN_PRODUCTION_MODE } from 'env'
import { useEffect, useRef } from 'react'

export function useUpdateReason<P extends Record<string, unknown>>(props: P) {
  const lastPropsRef = useRef<P>(props)
  useEffect(() => {
    if (IN_PRODUCTION_MODE) return
    const output: ([string, keyof P, P[keyof P]] | [string, keyof P, P[keyof P], P[keyof P]])[] = []
    for (const key of Object.keys(props)) {
      if (key === 'children') continue
      const $key = key as keyof P
      if (!(key in lastPropsRef.current)) output.push([`[Added]`, $key, props[$key]])
      if (lastPropsRef.current[$key] !== props[$key])
        output.push([`[Updated]`, $key, lastPropsRef.current[$key], props[$key]])
    }

    for (const key of Object.keys(lastPropsRef.current)) {
      if (key === 'children') continue
      const $key = key as keyof P
      if (!(key in props)) output.push([`[Removed]`, $key, props[$key]])
    }

    if (output.length) {
      console.group(`[Update Reasons]`)
      for (const record of output) {
        console.log(...record.map(r => (typeof r === 'function' ? '[fn]' : r)))
      }
      console.groupEnd()
    }

    lastPropsRef.current = props
  })
}
