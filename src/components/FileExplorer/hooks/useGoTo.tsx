import React, { useCallback } from 'react'
import { VisibleNodesGenerator } from 'utils/VisibleNodesGenerator'
import { useExpandTo } from './useExpandTo'

export function useGoTo(
  visibleNodesGenerator: VisibleNodesGenerator,
  updateSearchKey: React.Dispatch<React.SetStateAction<string>>,
  expandTo: ReturnType<typeof useExpandTo>,
) {
  return useCallback(
    (path: string[]) => {
      updateSearchKey('')
      visibleNodesGenerator.search(null)
      visibleNodesGenerator.onNextUpdate(() => expandTo(path))
    },
    [visibleNodesGenerator, updateSearchKey, expandTo],
  )
}
