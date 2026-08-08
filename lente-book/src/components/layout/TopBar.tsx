import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import BurgerMenu from './BurgerMenu'
import { useAuth } from '../../features/auth/AuthContext'
import lekeLenteLingoLogo from '../../assets/elements/Leke-lente-lingo.webp'
import styles from './TopBar.module.css'

const NAV = [
  {
    to: '/woordeboek',
    label: 'Woordeboek',
  },
  {
    to: '/foto',
    label: 'Voeg Foto By',
  },
  {
    to: '/woordjag',
    label: 'Woordjag',
  },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] =
    useState(false)
  const [profileImageFailed, setProfileImageFailed] =
    useState(false)

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, profile, logOut } = useAuth()

  const isOnboarding = pathname === '/welkom'

  const profileImage =
    user?.photoURL ??
    user?.providerData.find(
      (provider) => provider.providerId === 'google.com',
    )?.photoURL ??
    profile?.googlePhoto ??
    null

  const displayProfileImage =
    profileImageFailed
      ? null
      : profileImage?.replace(/=s\d+-c$/, '=s256-c') ?? null

  useEffect(() => {
    setProfileImageFailed(false)
  }, [profileImage])

  const handleLogOut = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    document.documentElement.classList.add(
      'lente-logging-out',
    )

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    })

    window.sessionStorage.setItem(
      'lente-return-onboarding',
      '1',
    )

    const homeLogo = document.querySelector<HTMLImageElement>(
      '[data-home-hero-logo]',
    )
    let temporaryLogo: HTMLImageElement

    if (homeLogo) {
      const bounds = homeLogo.getBoundingClientRect()
      temporaryLogo = homeLogo.cloneNode(true) as HTMLImageElement
      temporaryLogo.style.cssText = [
        'position:fixed',
        'z-index:9999',
        `left:${bounds.left}px`,
        `top:${bounds.top}px`,
        `width:${bounds.width}px`,
        `height:${bounds.height}px`,
        'max-width:none',
        'max-height:none',
        'object-fit:contain',
        'pointer-events:none',
      ].join(';')
      homeLogo.style.visibility = 'hidden'
    } else {
      temporaryLogo = document.createElement('img')
      temporaryLogo.src = lekeLenteLingoLogo
      temporaryLogo.alt = ''
      temporaryLogo.style.cssText = [
        'position:fixed',
        'z-index:9999',
        'left:50%',
        'top:50%',
        `width:min(${window.innerWidth <= 900 ? '92vw, 500px' : '52vw, 1000px'})`,
        'max-height:44svh',
        'object-fit:contain',
        'transform:translate(-50%, -50%)',
        'pointer-events:none',
      ].join(';')
    }
    temporaryLogo.dataset.sharedLogoTransition = 'reverse'
    temporaryLogo.setAttribute('aria-hidden', 'true')
    document.body.appendChild(temporaryLogo)

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1150)
    })

    const loggedOut = await logOut()

    if (loggedOut) {
      const returnedLogoBounds =
        temporaryLogo.getBoundingClientRect()

      navigate('/welkom', {
        replace: true,
        state: {
          reverseOnboarding: true,
          returnLogoLeft: returnedLogoBounds?.left,
          returnLogoTop: returnedLogoBounds?.top,
          returnLogoWidth: returnedLogoBounds?.width,
          returnLogoHeight: returnedLogoBounds?.height,
        },
      })
      window.setTimeout(() => {
        document.documentElement.classList.remove(
          'lente-logging-out',
        )
      }, 80)
      return
    }

    temporaryLogo.remove()
    if (homeLogo) homeLogo.style.visibility = 'visible'

    window.sessionStorage.removeItem(
      'lente-return-onboarding',
    )
    document.documentElement.classList.remove(
      'lente-logging-out',
    )
    setLoggingOut(false)
  }

  return (
    <>
      <header
        className={[
          styles.topBar,
          isOnboarding
            ? styles.onboardingBar
            : styles.siteBar,
          loggingOut
            ? styles.loggingOut
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!isOnboarding && (
          <div
            className={styles.navRibbon}
            aria-hidden="true"
          />
        )}

        <Link
          to={isOnboarding ? '/welkom' : '/'}
          className={styles.logoLink}
          aria-label="Lentedag-tuisblad"
        >
          <img
            src="/elements/lentedag-logo.webp"
            alt="Lentedag"
            className={styles.logo}
          />
        </Link>

        {!isOnboarding && (
          <>
            <nav
              className={styles.desktopNav}
              aria-label="Hoofkieslys"
            >
              {NAV.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${
                      isActive
                        ? styles.activeNavLink
                        : ''
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={styles.actions}>
              {user && profile && (
                <Link
                  to="/welkom"
                  className={styles.profileCard}
                  aria-label="Maak my profiel oop"
                >
                  <span className={styles.avatar}>
                    {displayProfileImage ? (
                      <img
                        src={displayProfileImage}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={() => setProfileImageFailed(true)}
                      />
                    ) : (
                      <span>
                        {profile.character}
                      </span>
                    )}
                  </span>

                  <span className={styles.profileDetails}>
                    <strong>
                      {profile.username}
                    </strong>
                  </span>
                </Link>
              )}

              {user && (
                <button
                  type="button"
                  className={styles.logoutButton}
                  disabled={loggingOut}
                  onClick={() => void handleLogOut()}
                  aria-label={loggingOut ? 'Teken tans uit' : 'Teken uit'}
                  title="Teken uit"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10M14.5 8.5 18 12l-3.5 3.5M9 12h9" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label={open ? 'Maak kieslys toe' : 'Maak kieslys oop'}
                aria-expanded={open}
                className={`${styles.menuButton} ${open ? styles.menuOpen : ''}`}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </>
        )}
      </header>

      {!isOnboarding && (
        <BurgerMenu
          open={open}
          onClose={() => setOpen(false)}
          onLogOut={handleLogOut}
        />
      )}
    </>
  )
}
