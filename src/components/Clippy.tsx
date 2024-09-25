import React, { useEffect, useRef, useState } from 'react'
import { cx } from 'utils/cx'
import { copyElementContent } from 'utils/DOMHelper'

type Props = {
  codeSnippetElement: Element
}

const className = 'clippy-wrapper'
export const ClippyClassName = className

export function Clippy({ codeSnippetElement }: Props) {
  const [state, setState] = useState<'normal' | 'success' | 'fail'>('normal')
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState('normal')
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [state])

  // Temporary fix:
  // React moved root node of event delegation since v17
  // onClick on <a /> won't work when rendered with `renderReact`
  const elementRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    const element = elementRef.current
    if (element) {
      const onClippyClick = () =>
        setState(copyElementContent(codeSnippetElement) ? 'success' : 'fail')

      element.addEventListener('click', onClippyClick)
      return () => element.removeEventListener('click', onClippyClick)
    }
  }, [codeSnippetElement])

  return (
    <div className={className}>
      <button className="clippy" ref={elementRef}>
        <i className={cx('icon', state)} />
      </button>
    </div>
  )
}
