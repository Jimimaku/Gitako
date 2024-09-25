import { useConfigs } from 'containers/ConfigsContext'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useDebounce, useLatest, useWindowSize } from 'react-use'
import { getDefaultConfigs } from 'utils/config/helper'
import * as DOMHelper from 'utils/DOMHelper'
import { useAfterRedirect } from 'utils/hooks/useFastRedirect'
import { ResizeHandlerOptions } from 'utils/hooks/useResizeHandler'
import { getSafeWidth } from '../utils/getSafeWidth'
import { ResizeHandler } from './ResizeHandler'
import { Size, Size2D } from './Size'

function useSidebarWidth() {
  const configContext = useConfigs()

  // size data flow:
  //    windowSize.width => width
  //                        width => config.sideBarWidth
  //                        width => --gitako-width       // layout effect
  //        resize event => width
  //        resize event =>          --gitako-width       // rAF
  const [width, setWidth] = useState(configContext.value.sideBarWidth)
  const { width: windowWidth } = useWindowSize()
  useEffect(() => {
    const safeSize = getSafeWidth(width, windowWidth)
    if (safeSize !== width) setWidth(safeSize)
  }, [windowWidth, width])
  useDebounce(() => configContext.onChange({ sideBarWidth: width }), 100, [width])

  useLayoutEffect(() => DOMHelper.setGitakoWidthCSSVariable(width), [width])

  const widthRef = useLatest(width)
  useEffect(() => {
    const detach = DOMHelper.attachStickyGitakoWidthCSSVariable(() => widthRef.current)
    return () => detach()
  }, [widthRef])

  // Keep variable when directing from PR to repo home via meta bar
  useAfterRedirect(useCallback(() => DOMHelper.setGitakoWidthCSSVariable(width), [width]))

  return [width, setWidth] as const
}

export function SideBarResizeHandler({
  onResizeStateChange,
}: Pick<ResizeHandlerOptions, 'onResizeStateChange'>) {
  const [width, setWidth] = useSidebarWidth()
  const { width: windowWidth } = useWindowSize()
  const onResize = useMemo(() => {
    let widthToApply: Size
    let pending = false
    return ([width]: Size2D) => {
      // do NOT merge this with the above similar effect
      widthToApply = width

      if (!pending) {
        pending = true
        // Update size using useEffect would cause delay
        requestAnimationFrame(() => {
          pending = false
          widthToApply = getSafeWidth(widthToApply, windowWidth)
          DOMHelper.setGitakoWidthCSSVariable(widthToApply)
          setWidth(widthToApply)
        })
      }
    }
  }, [windowWidth, setWidth])

  const onResetSize = useCallback(() => setWidth(getDefaultConfigs().sideBarWidth), [setWidth])

  const dummySize: Size2D = useMemo(() => [width, 0], [width])

  const placement = useConfigs().value.sidebarPlacement

  return (
    <ResizeHandler
      onResize={onResize}
      onResetSize={onResetSize}
      options={{
        onResizeStateChange,
        direction: placement === 'left' ? 'right' : 'left',
      }}
      size={dummySize}
    />
  )
}
