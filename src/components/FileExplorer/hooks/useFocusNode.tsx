import { useCallback } from 'react'
import { VisibleNodesGenerator } from 'utils/VisibleNodesGenerator'

export function useFocusNode(visibleNodesGenerator: VisibleNodesGenerator) {
  return useCallback(
    (node: TreeNode | null) => visibleNodesGenerator.focusNode(node),
    [visibleNodesGenerator],
  )
}
