import * as NProgress from 'nprogress'
import { useEffect } from 'react'
import { useEvent } from 'react-use'

const progressBar = {
  mount() {
    NProgress.start()
  },
  unmount() {
    NProgress.done()
  },
}

export function useProgressBar() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false })
  }, [])
  useEvent('pjax:fetch', progressBar.mount, window)
  useEvent('pjax:unload', progressBar.unmount, window)
}
