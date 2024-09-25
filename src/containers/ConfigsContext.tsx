import { PropsWithChildren } from 'common'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Config, configHelper } from 'utils/config/helper'

type ContextShape = IO<Config, Partial<Config>>
export type ConfigsContextShape = ContextShape

export const ConfigsContext = React.createContext<ContextShape | null>(null)

export function ConfigsContextWrapper(props: PropsWithChildren) {
  const [configs, setConfigs] = useState<Config | null>(null)
  useEffect(() => {
    configHelper.get().then(setConfigs)
  }, [])
  const onChange = useCallback(
    (updatedConfigs: Partial<Config>) => {
      const mergedConfigs = { ...configs, ...updatedConfigs } as Config
      configHelper.set(mergedConfigs)
      setConfigs(mergedConfigs)
    },
    [configs, setConfigs],
  )
  if (configs === null) return null
  return (
    <ConfigsContext.Provider value={{ value: configs, onChange }}>
      {props.children}
    </ConfigsContext.Provider>
  )
}

export const useConfigs = createUseNonNullContext(ConfigsContext)

function createUseNonNullContext<T>(theContext: React.Context<T | null>): () => T {
  return () => {
    const context = useContext(theContext)
    if (context === null) throw new Error(`Empty context`)
    return context
  }
}
