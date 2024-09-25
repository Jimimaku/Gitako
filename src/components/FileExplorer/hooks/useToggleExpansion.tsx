import { useCallback } from 'react'
import { VisibleNodesGenerator } from 'utils/VisibleNodesGenerator'

export function useToggleExpansion(visibleNodesGenerator: VisibleNodesGenerator) {
  return useCallback(
    async (
      node: TreeNode,
      {
        recursive = false,
      }: {
        recursive?: boolean
      },
    ) => {
      if (node.type === 'tree') {
        visibleNodesGenerator.focusNode(node)
        await visibleNodesGenerator.toggleExpand(node, recursive)
      }
    },
    [visibleNodesGenerator],
  )
}
