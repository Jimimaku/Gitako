import { PropsWithChildren } from 'common'
import React, { useCallback, useState } from 'react'
import { noop } from 'utils/general'

export type ReloadContextShape = () => void

export const ReloadContext = React.createContext<ReloadContextShape>(noop)

export function ReloadContextWrapper({ children }: PropsWithChildren) {
  const [key, setKey] = useState(0)
  const reload = useCallback(() => setKey(key => key + 1), [])

  return (
    <ReloadContext.Provider key={key} value={reload}>
      {children}
    </ReloadContext.Provider>
  )
}
