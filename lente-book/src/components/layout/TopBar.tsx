import { useState } from 'react'
import {
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom'

import BurgerMenu from './BurgerMenu'
import { useAuth } from '../../features/auth/AuthContext'
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

  const { pathname } = useLocation()
  const { user, profile } = useAuth()

  const isOnboarding = pathname === '/welkom'

  const profileImage =
    profile?.useGooglePhoto && user?.photoURL
      ? user.photoURL
      : null

  return (
    <>
      <header
        className={`${styles.topBar} ${
          isOnboarding
            ? styles.onboardingBar
            : styles.siteBar
        }`}
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
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt=""
                      />
                    ) : (
                      <span>
                        {profile.character}
                      </span>
                    )}
                  </span>

                  <span className={styles.profileDetails}>
                    <small>My profiel</small>

                    <strong>
                      {profile.username}
                    </strong>
                  </span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Maak kieslys oop"
                aria-expanded={open}
                className={styles.menuButton}
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
        />
      )}
    </>
  )
}