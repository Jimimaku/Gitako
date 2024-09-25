import { useCallback } from 'react'
import { VisibleNodesGenerator } from 'utils/VisibleNodesGenerator'

export function useExpandTo(visibleNodesGenerator: VisibleNodesGenerator) {
  return useCallback(
    async (currentPath: string[]) => {
      const nodeExpandedTo = await visibleNodesGenerator.expandTo(currentPath.join('/'))
      if (nodeExpandedTo) visibleNodesGenerator.focusNode(nodeExpandedTo)
    },
    [visibleNodesGenerator],
  )
}
