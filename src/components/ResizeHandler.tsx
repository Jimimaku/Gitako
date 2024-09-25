import { GrabberIcon } from '@primer/octicons-react'
import { Icon } from 'components/Icon'
import React from 'react'
import { ResizeHandlerOptions, useResizeHandler } from '../utils/hooks/useResizeHandler'
import { Size2D } from './Size'

type Props = {
  size: Size2D
  onResize(size: Size2D): void
  onResetSize?(): void
  options?: ResizeHandlerOptions
  style?: React.CSSProperties
}

export function ResizeHandler({ onResize, onResetSize, options, size, style }: Props) {
  const { onPointerDown } = useResizeHandler(size, onResize, options)

  return (
    <div
      className={'gitako-resize-handler'}
      onPointerDown={onPointerDown}
      onDoubleClick={onResetSize}
      style={style}
    >
      <Icon IconComponent={GrabberIcon} />
    </div>
  )
}
