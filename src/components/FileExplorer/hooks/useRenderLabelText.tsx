import { useConfigs } from 'containers/ConfigsContext'
import { useCallback } from 'react'
import { searchModes } from '../../searchModes'

export function useRenderLabelText(searchKey: string) {
  const { searchMode } = useConfigs().value
  return useCallback(
    (node: TreeNode) => searchModes[searchMode].renderNodeLabelText(node, searchKey),
    [searchKey, searchMode],
  )
}
