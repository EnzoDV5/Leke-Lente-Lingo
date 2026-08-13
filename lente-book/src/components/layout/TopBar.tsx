import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom'

import BurgerMenu from './BurgerMenu'
import ProfileModal from '../profile/ProfileModal'
import { useAuth } from '../../features/auth/AuthContext'
import {
  fallbackProfileAvatar,
  resolveProfileAvatar,
} from '../../lib/profileAvatars'
import styles from './TopBar.module.css'

const NAV = [
  {
    to: '/woordeboek',
    label: 'Woordeboek',
  },
  {
    to: '/foto',
    label: 'Voeg Foto',
  },
  {
    to: '/woordjag',
    label: 'Lente Bingo',
  },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [profileImageFailed, setProfileImageFailed] =
    useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const { pathname } = useLocation()
  const { user, profile } = useAuth()

  const isOnboarding = pathname === '/welkom'

  const profileImage = resolveProfileAvatar(
    profile?.character,
  ) ?? fallbackProfileAvatar(profile?.uid)

  const displayProfileImage =
    profileImageFailed
      ? null
      : profileImage?.replace(/=s\d+-c$/, '=s256-c') ?? null

  useEffect(() => {
    setProfileImageFailed(false)
  }, [profileImage])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={[
          styles.topBar,
          isOnboarding
            ? styles.onboardingBar
            : styles.siteBar,
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
          viewTransition
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
                  viewTransition
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
                <button
                  type="button"
                  className={styles.profileCard}
                  aria-label="Maak my profiel oop"
                  onClick={() => setProfileModalOpen(true)}
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
        />
      )}

      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  )
}
