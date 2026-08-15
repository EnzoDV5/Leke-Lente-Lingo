import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import Marquee from '../../components/layout/Marquee'
import HoeDitWerk from '../home/sections/HoeDitWerk'
import Leaderboard from '../home/sections/Leaderboard'
import lekeLenteLingoLogo from '../../assets/elements/Leke-lente-lingo.webp'
import binocularsElement from '../../assets/elements/poster elements/binuculars.webp'
import mouthElement from '../../assets/elements/poster elements/Mouth.webp'
import PreCampaignPhrases from './PreCampaignPhrases'
import styles from './PreCampaignHome.module.css'

const FESTIVAL_START = new Date('2026-09-16T09:00:00+02:00').getTime()

function countdownParts(now: number) {
  const remaining = Math.max(0, FESTIVAL_START - now)
  const totalSeconds = Math.floor(remaining / 1000)

  return [
    { label: 'Dae', value: Math.floor(totalSeconds / 86400) },
    { label: 'Ure', value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: 'Min', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 'Sek', value: totalSeconds % 60 },
  ]
}

function FestivalCountdown() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const parts = countdownParts(now)
  const isFestivalDay = now >= FESTIVAL_START

  return (
    <div
      className={styles.countdown}
      aria-label={isFestivalDay
        ? 'Lentedag is hier'
        : `${parts[0].value} dae, ${parts[1].value} ure, ${parts[2].value} minute en ${parts[3].value} sekondes tot Lentedag`}
    >
      <span className={styles.countdownFlag} aria-hidden="true">
        <i /> {isFestivalDay ? 'LENTEDAG IS HIER!' : 'AFTEL TOT LENTEDAG'}
      </span>

      <span className={styles.countdownUnits} aria-hidden="true">
        {parts.map((part) => (
          <span className={styles.countdownUnit} key={part.label}>
            <strong>{String(part.value).padStart(2, '0')}</strong>
            <small>{part.label}</small>
          </span>
        ))}
      </span>

      <small className={styles.countdownDate} aria-hidden="true">
        16 SEPTEMBER 2026 · PRETORIA
      </small>
    </div>
  )
}

export default function PreCampaignHome() {
  const heroLogoRef = useRef<HTMLImageElement>(null)
  const heroMouthRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const targets = {
      logo: heroLogoRef.current,
      mouth: heroMouthRef.current,
    }
    const sharedPieces = Array.from(
      document.querySelectorAll<HTMLImageElement>(
        '[data-shared-brand-piece]',
      ),
    )
    const animations: Animation[] = []

    if (!sharedPieces.length) return

    // Hide the real hero pieces synchronously, before the browser paints this
    // frame. Deferring this into the rAF below (as it used to be) let the
    // real logo/mouth flash fully visible for a frame while the shared clone
    // sat on top of it, reading as two overlapping logos swapping places.
    sharedPieces.forEach((sharedPiece) => {
      const piece =
        sharedPiece.dataset.sharedBrandPiece as keyof typeof targets
      const target = targets[piece]
      if (target) target.style.visibility = 'hidden'
    })

    const firstFrame = window.requestAnimationFrame(() => {
      sharedPieces.forEach((sharedPiece) => {
        const piece =
          sharedPiece.dataset.sharedBrandPiece as keyof typeof targets
        const target = targets[piece]

        if (!target) {
          sharedPiece.remove()
          return
        }

        const source = sharedPiece.getBoundingClientRect()
        const destination = target.getBoundingClientRect()
        const moveX =
          destination.left +
          destination.width / 2 -
          (source.left + source.width / 2)
        const moveY =
          destination.top +
          destination.height / 2 -
          (source.top + source.height / 2)
        const scale =
          destination.width /
          Math.max(source.width, 1)

        const animation = sharedPiece.animate(
          [
            { transform: 'translate3d(0, 0, 0) scale(1)' },
            { transform: `translate3d(${moveX}px, ${moveY}px, 0) scale(${scale})` },
          ],
          {
            duration: 980,
            easing: 'cubic-bezier(.16, 1, .3, 1)',
            fill: 'forwards',
          },
        )

        animations.push(animation)

        void animation.finished.catch(() => undefined).then(() => {
          sharedPiece.remove()
          target.style.visibility = ''
        })
      })
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      animations.forEach((animation) => animation.cancel())
      sharedPieces.forEach((sharedPiece) => sharedPiece.remove())
      Object.values(targets).forEach((target) => {
        if (target) target.style.visibility = ''
      })
    }
  }, [])

  return (
    <>
      <section
        className={styles.cloudHero}
        aria-label="Leke Lente Lingo"
      >
        <div className={styles.heroBrand}>
          <img
            ref={heroMouthRef}
            className={styles.heroMouth}
            src={mouthElement}
            alt=""
            aria-hidden="true"
          />

          <img
            ref={heroLogoRef}
            data-home-hero-logo
            src={lekeLenteLingoLogo}
            alt="Leke Lente Lingo"
            className={styles.heroLogo}
          />

          <img
            className={styles.heroBinoculars}
            src={binocularsElement}
            alt=""
            aria-hidden="true"
          />

          <FestivalCountdown />
        </div>
      </section>

      <div className={styles.homeContent}>
        <Marquee />
        <Leaderboard />
        <PreCampaignPhrases />
        <HoeDitWerk />
      </div>
    </>
  )
}
