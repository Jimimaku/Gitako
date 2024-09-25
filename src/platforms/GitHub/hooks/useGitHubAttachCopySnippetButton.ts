import { platform } from 'platforms'
import { useCallback, useEffect } from 'react'
import { useAfterRedirect } from 'utils/hooks/useFastRedirect'
import * as DOMHelper from '../DOMHelper'
import { GitHub } from '../index'

export function useGitHubAttachCopySnippetButton(copySnippetButton: boolean) {
  const attachCopySnippetButton = useCallback(
    function attachCopySnippetButton() {
      if (platform === GitHub && copySnippetButton) DOMHelper.attachCopySnippet()
    },
    [copySnippetButton],
  )
  useEffect(attachCopySnippetButton, [attachCopySnippetButton])
  useAfterRedirect(attachCopySnippetButton)
}
