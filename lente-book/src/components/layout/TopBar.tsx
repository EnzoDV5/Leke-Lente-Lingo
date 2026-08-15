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
import { useCampaign } from '../../features/campaign/CampaignProvider'
import { CAMPAIGN_NAVIGATION } from '../../features/campaign/campaignConfig'

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [profileImageFailed, setProfileImageFailed] =
    useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const { pathname } = useLocation()
  const { user, profile } = useAuth()
  const { phase } = useCampaign()
  const navigation = phase === 'live'
    ? CAMPAIGN_NAVIGATION.live.filter((item) => item.to !== '/')
    : []

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
          phase !== 'live' && !isOnboarding
            ? styles.compactBar
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

        {!isOnboarding && phase === 'post' && (
          <Link
            to="/woordeboek"
            viewTransition
            className={`${styles.profileCard} ${styles.wordbookLink} ${styles.postWordbookLink}`}
            aria-label="Maak die Lente Woordeboek oop"
          >
            <span className={styles.wordbookIcon} aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <path d="M4.5 6.5c4.5-.8 8.2.1 11.5 2.7v17c-3.3-2.6-7-3.5-11.5-2.7v-17Z" />
                <path d="M27.5 6.5c-4.5-.8-8.2.1-11.5 2.7v17c3.3-2.6 7-3.5 11.5-2.7v-17Z" />
                <path d="M8 11c2.1-.1 3.8.3 5.4 1.3M8 15c2.1-.1 3.8.3 5.4 1.3M24 11c-2.1-.1-3.8.3-5.4 1.3M24 15c-2.1-.1-3.8.3-5.4 1.3" />
              </svg>
            </span>
            <span className={styles.profileDetails}>
              <strong>Woordeboek</strong>
            </span>
          </Link>
        )}

        {!isOnboarding && (
          <>
            <nav
              className={styles.desktopNav}
              aria-label="Hoofkieslys"
            >
              {navigation.map((item) => (
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

            {phase !== 'post' && (
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

              {phase === 'live' && (
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
              )}
            </div>
            )}
          </>
        )}
      </header>

      {!isOnboarding && phase === 'live' && (
        <BurgerMenu
          open={open}
          onClose={() => setOpen(false)}
        />
      )}

      {phase !== 'post' && (
        <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      )}
    </>
  )
}
