import React, { useEffect, useRef, useState } from 'react'
import { cx } from 'utils/cx'
import { copyElementContent } from 'utils/DOMHelper'
import { getCodeElement } from './DOMHelper'

const className = 'gitako-copy-file-button'
export const copyFileButtonClassName = className

const contents = {
  success: 'Success!',
  error: 'Copy failed!',
  normal: 'Copy file',
}

export function CopyFileButton() {
  const [content, setContent] = useState(contents.normal)
  useEffect(() => {
    if (content !== contents.normal) {
      const timer = setTimeout(() => {
        setContent(contents.normal)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [content])

  const elementRef = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    // Temporary fix:
    // React moved root node of event delegation since v17
    // onClick on <a /> won't work when rendered with `renderReact`
    const element = elementRef.current
    if (element) {
      const copyCode = () => {
        const codeElement = getCodeElement()
        if (codeElement) {
          setContent(copyElementContent(codeElement, true) ? contents.success : contents.error)
        }
      }
      element.addEventListener('click', copyCode)
      return () => element.removeEventListener('click', copyCode)
    }
  }, [])

  return (
    <a ref={elementRef} className={cx('btn btn-sm BtnGroup-item', className)}>
      {content}
    </a>
  )
}
