import { PropsWithChildren } from 'common'
import { useConfigs } from 'containers/ConfigsContext'
import { platform } from 'platforms'
import React, { useEffect, useRef } from 'react'
import { parseURLSearch, run } from 'utils/general'
import { useLoadedContext } from 'utils/hooks/useLoadedContext'
import { useStateIO } from 'utils/hooks/useStateIO'
import { sanitizedLocation } from 'utils/URLHelper'
import { SideBarStateContext } from './SideBarState'

/**
 * Setup access token before sending other requests
 */
export function OAuthWrapper({ children }: PropsWithChildren) {
  const running = useGetAccessToken()
  const $state = useLoadedContext(SideBarStateContext)

  const needGetAccessTokenRef = useRef(running)
  useEffect(() => {
    if (needGetAccessTokenRef.current) {
      $state.onChange(running ? 'getting-access-token' : 'after-getting-access-token')
    }
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  // block children rendering on the first render if setting token
  if (running && $state.value !== 'getting-access-token') return null
  return <>{children}</>
}

function useGetAccessToken() {
  const $block = useStateIO(() => Boolean(getCodeSearchParam()))
  const configContext = useConfigs()
  const { accessToken } = configContext.value
  useEffect(() => {
    run(async function () {
      const code = getCodeSearchParam()
      if (code && !accessToken) {
        const accessToken = await getAccessTokenWithCode(code)
        if (accessToken) configContext.onChange({ accessToken })
      }
      $block.onChange(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return $block.value
}

function getCodeSearchParam() {
  return parseURLSearch().get('code')
}

async function getAccessTokenWithCode(code: string) {
  const accessToken = await platform.setOAuth(code)
  if (!accessToken) alert(`Gitako: The OAuth token may have expired, please try again.`)
  const search = parseURLSearch()
  search.delete('code')
  window.history.replaceState(
    {},
    'removed search param',
    sanitizedLocation.pathname.replace(window.location.search, '?' + search.toString()),
  )
  return accessToken
}
