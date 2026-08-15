import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'

import OptionWheel from '../ui/OptionWheel'
import styles from './BurgerMenu.module.css'
import { useCampaign } from '../../features/campaign/CampaignProvider'
import { CAMPAIGN_NAVIGATION } from '../../features/campaign/campaignConfig'

type Props = {
  open: boolean
  onClose: () => void
}

const SOCIALS = [
  {
    label: 'Instagram',
    paths: [
      'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Z',
      'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z',
    ],
  },
  {
    label: 'Spotify',
    paths: [
      'M12 1.5A10.5 10.5 0 1 0 12 22.5 10.5 10.5 0 0 0 12 1.5Zm4.82 15.12a.78.78 0 0 1-1.07.26c-2.94-1.8-6.64-2.2-11-1.2a.78.78 0 1 1-.35-1.52c4.77-1.09 8.86-.63 12.16 1.39.37.22.48.7.26 1.07Zm1.43-3.18a.98.98 0 0 1-1.35.32c-3.37-2.07-8.5-2.67-12.48-1.46a.98.98 0 1 1-.57-1.87c4.55-1.38 10.2-.71 14.08 1.67.46.28.6.88.32 1.34Zm.12-3.31C14.33 7.73 7.66 7.5 3.8 8.67a1.17 1.17 0 1 1-.68-2.24c4.43-1.34 11.8-1.07 16.44 1.68a1.17 1.17 0 0 1-1.19 2.02Z',
    ],
  },
  {
    label: 'TikTok',
    paths: ['M16.6 2c.35 2.1 1.58 3.36 3.4 3.5v3.58a8.3 8.3 0 0 1-3.35-.77v6.52a7.17 7.17 0 1 1-6.18-7.1v3.65a3.58 3.58 0 1 0 2.56 3.43V2h3.57Z'],
  },
  {
    label: 'YouTube',
    paths: ['M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.58 12 3.58 12 3.58s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.12A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.83 12 9.6 15.6Z'],
  },
  {
    label: 'Facebook',
    paths: ['M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z'],
  },
]

export default function BurgerMenu({
  open,
  onClose,
}: Props) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { phase } = useCampaign()
  const links = CAMPAIGN_NAVIGATION[phase]

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const closeWhenHidden = () => {
      if (document.visibilityState === 'hidden') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    document.addEventListener('visibilitychange', closeWhenHidden)

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('visibilitychange', closeWhenHidden)
    }
  }, [onClose, open])

  const currentIndex = Math.max(
    0,
    links.findIndex((link) =>
      link.to === '/'
        ? pathname === '/'
        : pathname.startsWith(link.to),
    ),
  )

  const selectWheelItem = (index: number) => {
    const link = links[index]
    if (!link) return
    onClose()

    if (pathname === link.to) return

    if (pathname === '/' && link.to !== '/') {
      document.documentElement.classList.add('lente-home-leaving')
      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 620
      window.setTimeout(() => navigate(link.to), delay)
      return
    }

    navigate(link.to, { viewTransition: true })
  }

  return createPortal(
    <div
      className={`${styles.overlay} ${open ? styles.open : ''} fixed inset-0 z-40 overflow-hidden pt-[78px]`}
      aria-hidden={!open}
    >
      <div className={styles.menuClouds} aria-hidden="true">
        {['cloud1', 'cloud3', 'cloud6', 'cloud2'].map(
          (cloud) => (
            <span className={styles.menuCloud} key={cloud}>
              <img src={`/elements/${cloud}.webp`} alt="" />
            </span>
          ),
        )}
      </div>

      <nav className={`${styles.wheelStage} absolute inset-x-0 bottom-0 top-[78px] z-10`} aria-label="Mobiele hoofkieslys">
        <OptionWheel
          key={`${pathname}-${open ? 'open' : 'closed'}`}
          items={[
            ...links.map((link) => link.label),
          ]}
          defaultSelected={currentIndex}
          textColor="#f8e42b"
          activeColor="#ffffff"
          side="right"
          fontSize={1.65}
          spacing={1.76}
          curve={1}
          tilt={12}
          blur={.8}
          fade={.22}
          minOpacity={.14}
          smoothing={190}
          inset={18}
          draggable
          onSelect={selectWheelItem}
        />
      </nav>

      <div className={styles.socials} aria-label="Sosiale media">
        {SOCIALS.map(({ label, paths }) => (
          <button
            className={styles.socialButton}
            type="button"
            aria-label={label}
            title={label}
            key={label}
          >
            {label === 'Spotify' ? (
              <svg className={styles.spotifyIcon} aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" />
                <path d="M5.2 9.1c4.4-1.3 9.5-.8 13.4 1.35" />
                <path d="M6.15 12.35c3.75-1.05 8.15-.58 11.35 1.18" />
                <path d="M7.05 15.35c3.05-.72 6.45-.35 9.05 1.05" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                {paths.map((path) => <path d={path} key={path} />)}
              </svg>
            )}
          </button>
        ))}
      </div>

    </div>,
    document.body,
  )
}
