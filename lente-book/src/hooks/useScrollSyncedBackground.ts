import { useEffect, type RefObject } from 'react'

/** Keeps the existing grass parallax in sync without measuring or painting
 * sections while they are outside the viewport. */
export function useScrollSyncedBackground(
  enabled: boolean,
  ...refs: Array<RefObject<HTMLElement | null>>
) {
  useEffect(() => {
    if (!enabled) return

    const elements = refs
      .map((ref) => ref.current)
      .filter((element): element is HTMLElement => Boolean(element))
    if (!elements.length) return

    let frame = 0
    const visible = new Set<HTMLElement>()
    const sync = () => {
      frame = 0
      visible.forEach((element) => {
        const bounds = element.getBoundingClientRect()
        element.style.setProperty('--grass-scroll-y', `${-bounds.top}px`)
      })
    }
    const requestSync = () => {
      if (visible.size && !frame) frame = window.requestAnimationFrame(sync)
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement
        if (entry.isIntersecting) visible.add(element)
        else visible.delete(element)
      })
      requestSync()
    }, { rootMargin: '120px 0px' })

    elements.forEach((element) => {
      const bounds = element.getBoundingClientRect()
      if (bounds.bottom >= -120 && bounds.top <= window.innerHeight + 120) visible.add(element)
      observer.observe(element)
    })
    sync()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)

    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
    }
  // The ref objects are stable for the lifetime of each page component.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}
