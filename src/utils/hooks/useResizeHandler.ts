import React, { useCallback, useEffect, useRef } from 'react'
import { Size2D } from '../../components/Size'

export type ResizeState = 'idle' | 'resizing'

export type ResizeHandlerOptions = Partial<{
  onResizeStateChange: (state: ResizeState) => void
  onClick: (e: PointerEvent) => void
  distanceTolerance: number
  direction: 'right' | 'left'
}>

export function useResizeHandler(
  size: Size2D,
  onResize: (size: Size2D) => void,
  {
    onResizeStateChange,
    onClick,
    distanceTolerance = 2,
    direction = 'right',
  }: ResizeHandlerOptions = {},
) {
  const pointerDown = useRef(false)
  const pointerMoved = useRef(false)
  const initialSizeRef = useRef([0, 0])
  const baseSize = useRef(size)
  const latestPropSize = useRef(size)
  const fix = {
    left: -1,
    right: 1,
  }[direction]

  useEffect(() => {
    latestPropSize.current = size
  }, [size])

  useEffect(() => {
    const onPointerMove = ({ clientX, clientY }: PointerEvent) => {
      if (!pointerDown.current) return
      const [x0, y0] = initialSizeRef.current
      // Allow minor movement, this happened unintentionally for few times when I use track pad
      pointerMoved.current =
        pointerMoved.current || (clientX - x0) ** 2 + (clientY - y0) ** 2 > distanceTolerance ** 2
      const [x1, y1] = baseSize.current
      onResize([x1 + (clientX - x0) * fix, y1 + (clientY - y0) * fix])
    }
    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [onResize, distanceTolerance, fix])

  useEffect(() => {
    const onPointerUp = (e: PointerEvent) => {
      if (pointerDown.current) {
        pointerDown.current = false

        if (!pointerMoved.current) onClick?.(e)
        pointerMoved.current = false

        baseSize.current = latestPropSize.current
        onResizeStateChange?.('idle')
      }
    }
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [onClick, onResizeStateChange])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault() // Prevent unexpected selection when dragging in Safari
      const { clientX, clientY } = e
      pointerDown.current = true
      initialSizeRef.current = [clientX, clientY]
      baseSize.current = latestPropSize.current
      onResizeStateChange?.('resizing')
    },
    [onResizeStateChange],
  )

  return { onPointerDown }
}
