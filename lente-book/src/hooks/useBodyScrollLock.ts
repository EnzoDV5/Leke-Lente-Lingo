import { useEffect } from 'react'

let activeLocks = 0
let lockedScrollY = 0
let previousBodyStyles: Partial<CSSStyleDeclaration> = {}
let previousHtmlOverflow = ''

export function useBodyScrollLock(locked = true) {
  useEffect(() => {
    if (!locked) return

    activeLocks += 1
    if (activeLocks === 1) {
      lockedScrollY = window.scrollY
      previousHtmlOverflow = document.documentElement.style.overflow
      previousBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      }
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${lockedScrollY}px`
      document.body.style.width = '100%'
    }

    return () => {
      activeLocks = Math.max(0, activeLocks - 1)
      if (activeLocks !== 0) return
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyStyles.overflow ?? ''
      document.body.style.position = previousBodyStyles.position ?? ''
      document.body.style.top = previousBodyStyles.top ?? ''
      document.body.style.width = previousBodyStyles.width ?? ''
      window.scrollTo({ top: lockedScrollY, left: 0, behavior: 'instant' })
    }
  }, [locked])
}
