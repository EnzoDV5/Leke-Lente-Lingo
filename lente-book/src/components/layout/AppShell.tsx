import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  useEffect,
  useRef,
  type MouseEvent,
  type CSSProperties,
} from 'react'
import TopBar from './TopBar'
import Footer from './Footer'
import styles from './AppShell.module.css'

type RouteState = {
  onboardingReveal?: boolean
}

const ROUTE_ORDER: Record<string, number> = {
  '/woordeboek': 0,
  '/foto': 1,
  '/woordjag': 2,
}

const routeOrder = (path: string) =>
  path.startsWith('/woordeboek')
    ? ROUTE_ORDER['/woordeboek']
    : ROUTE_ORDER[path]

const heroKind = (path: string) => {
  if (path === '/') return 'home'
  if (path === '/woordjag') return 'woordjag'
  if (path === '/challenge/foto') return 'compact'
  if (path.startsWith('/woordeboek/')) return 'detail'
  if (path.startsWith('/challenge/')) return 'challenge'
  if (path === '/woordeboek' || path === '/foto') return 'compact'
  return 'hidden'
}

type RouteStyle = CSSProperties & {
  '--route-enter-x': string
  '--route-motion-delay': string
}

export default function AppShell() {
  const pageRef = useRef<HTMLElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const previousPathRef = useRef(location.pathname)
  const previousPath = previousPathRef.current
  const routeState =
    location.state as RouteState | null

  const revealHome =
    Boolean(routeState?.onboardingReveal)

  const currentHeroKind = heroKind(location.pathname)
  const heroDividerClass =
    currentHeroKind === 'home'
      ? styles.dividerHome
      : currentHeroKind === 'woordjag'
        ? styles.dividerWoordjag
        : currentHeroKind === 'detail'
          ? styles.dividerDetail
          : currentHeroKind === 'challenge'
            ? styles.dividerChallenge
          : currentHeroKind === 'compact'
          ? styles.dividerCompact
          : styles.dividerHidden

  const currentOrder = routeOrder(location.pathname)
  const previousOrder = routeOrder(previousPath)
  const routeEnterX =
    currentOrder === undefined || previousOrder === undefined
      ? '0px'
      : currentOrder >= previousOrder
        ? '84px'
        : '-84px'
  const sameHeroHeight = heroKind(previousPath) === currentHeroKind
  const routeMotionDelay = sameHeroHeight ? '0ms' : '760ms'

  useEffect(() => {
    previousPathRef.current = location.pathname
    document.documentElement.classList.remove('lente-home-leaving')
  }, [location.pathname])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const isPosterDeepLink =
      location.pathname === '/woordjag' &&
      params.has('poster')

    if (!isPosterDeepLink) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      })
    }
  }, [location.key, location.pathname, location.search])

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const registered = new WeakSet<Element>()
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('lente-scroll-revealed')
          revealObserver.unobserve(entry.target)
        })
      },
      {
        threshold: window.innerWidth <= 680 ? .08 : .14,
        rootMargin: '0px 0px -7% 0px',
      },
    )

    const registerRevealItems = () => {
      const candidates = page.querySelectorAll(
        '[data-scroll-reveal], section > div, article, ul > li',
      )
      let revealIndex = 0
      candidates.forEach((element) => {
        if (registered.has(element)) return
        if (element.parentElement === page) return
        if (element.closest('header')) return
        if (element.closest('[aria-label="Leke Lente Lingo"]')) return

        registered.add(element)
        const htmlElement = element as HTMLElement
        const requestedMotion = htmlElement.dataset.scrollReveal
        const motion = requestedMotion || (
          window.innerWidth <= 680
            ? 'up'
            : element.matches('article, li')
              ? revealIndex % 2 === 0 ? 'left' : 'right'
              : 'up'
        )
        htmlElement.dataset.revealMotion = motion
        htmlElement.style.setProperty('--scroll-reveal-delay', `${Math.min(revealIndex % 4, 3) * 65}ms`)
        htmlElement.classList.add('lente-scroll-reveal')
        revealIndex += 1

        if (reduceMotion) {
          htmlElement.classList.add('lente-scroll-revealed')
        } else {
          revealObserver.observe(htmlElement)
        }
      })
    }

    registerRevealItems()
    const mutationObserver = new MutationObserver(registerRevealItems)
    mutationObserver.observe(page, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      revealObserver.disconnect()
    }
  }, [location.key])

  const handleNavigationCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (location.pathname !== '/' || event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

    const destination = new URL(anchor.href, window.location.href)
    if (destination.origin !== window.location.origin) return
    if (!(destination.pathname in ROUTE_ORDER)) return

    event.preventDefault()
    document.documentElement.classList.add('lente-home-leaving')
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 620
    window.setTimeout(() => navigate(`${destination.pathname}${destination.search}${destination.hash}`), delay)
  }

  return (
    <div
      className={[
        styles.shell,
        revealHome
          ? styles.homeReveal
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.shellContent} onClickCapture={handleNavigationCapture}>
        <TopBar />

        <span
          className={`${styles.contentSurface} ${heroDividerClass}`}
          aria-hidden="true"
        />

        <span
          className={`${styles.heroDivider} ${heroDividerClass}`}
          aria-hidden="true"
        />

        <main
          ref={pageRef}
          className={`${styles.page} ${location.pathname === '/' ? styles.homeRoute : styles.innerRoute}`}
          key={location.pathname}
          style={{
            '--route-enter-x': routeEnterX,
            '--route-motion-delay': routeMotionDelay,
          } as RouteStyle}
        >
          <Outlet />
        </main>

        <div className={`${styles.footer} ${location.pathname === '/woordjag' ? styles.footerFlush : ''}`}>
          <Footer />
        </div>
      </div>
    </div>
  )
}
