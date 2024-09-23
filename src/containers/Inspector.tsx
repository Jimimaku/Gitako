import { PropsWithChildren, ReactIO } from 'common'
import { IN_PRODUCTION_MODE } from 'env'
import React, { useContext, useEffect } from 'react'
import { Config } from 'utils/config/helper'
import { noop } from 'utils/general'
import { useStateIO } from 'utils/hooks/useStateIO'
import { useConfigs } from './ConfigsContext'

export type InspectorContextShape = ReactIO<JSONObject>

export const InspectorContext = React.createContext<InspectorContextShape | null>(null)

export const InspectorContextWrapper = IN_PRODUCTION_MODE
  ? React.Fragment
  : function InspectorContextWrapper({ children }: PropsWithChildren) {
      const $ = useStateIO<JSONObject>({})
      const configs = useConfigs()
      const { __showInspector: show } = configs.value
      const setShow = (__showInspector: Config['__showInspector']) =>
        configs.onChange({ __showInspector })

      return (
        <InspectorContext.Provider value={$}>
          {show ? (
            <div
              style={{
                position: 'fixed',
                zIndex: Number.MAX_SAFE_INTEGER,
                top: '0',
                right: '0',
                height: '100vh',
                width: '360px',
                background: 'rgba(255, 255, 255, 0.75)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShow(false)}>❌</button>
              </div>
              <pre
                style={{
                  flex: 1,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify($.value, null, 2)}
              </pre>
            </div>
          ) : (
            <div
              style={{
                position: 'fixed',
                top: '0',
                right: '0',
              }}
            >
              <button onClick={() => setShow(true)}>🔎</button>
            </div>
          )}
          {children}
        </InspectorContext.Provider>
      )
    }

export const useInspector = IN_PRODUCTION_MODE
  ? noop
  : function useInspector(key: string, value: JSONValue) {
      const $ = useContext(InspectorContext)
      useEffect(() => {
        $?.onChange(prev => ({ ...prev, [key]: value }))
      }, [key, value]) // eslint-disable-line react-hooks/exhaustive-deps
    }
