import React, { useCallback } from 'react'
import { VisibleNodesGeneratorMethods } from './hooks/useVisibleNodesGeneratorMethods'
import { AlignMode } from './useVirtualScroll'

export function useHandleNodeFocus(
  { focusNode }: VisibleNodesGeneratorMethods,
  setAlignMode: (mode: AlignMode) => void,
) {
  return useCallback(
    (event: React.FocusEvent<HTMLElement, Element>, node: TreeNode) => {
      setAlignMode('lazy')
      focusNode(node)
    },
    [focusNode, setAlignMode],
  )
}
