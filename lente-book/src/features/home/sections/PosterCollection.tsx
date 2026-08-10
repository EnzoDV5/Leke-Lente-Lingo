import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Section from '../../../components/ui/Section'
import Reveal from '../../../components/ui/Reveal'
import { useChallengeProgress } from '../../../hooks/useChallengeProgress'
import { useAuth } from '../../auth/AuthContext'
import { ALL_CHALLENGE_IDS, CHALLENGES, type ChallengeId } from '../../challenges/challengeConfig'
import styles from './PosterCollection.module.css'

const POSTERS: Record<ChallengeId, string> = {
  doop: '/posters/doop-dit.webp', remix: '/posters/steel-en-verbeter.webp',
  guess: '/posters/raai-die-woord.webp', photo: '/posters/foto-doop.webp',
  friend: '/posters/daag-n-maat-uit.webp', wildcard: '/posters/wildcard.webp',
}

export default function PosterCollection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [posterStripScrolled, setPosterStripScrolled] = useState(false)
  const { user } = useAuth()
  const { progress, collectedCount, loading } = useChallengeProgress(user?.uid)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frame = 0
    const syncGrass = () => {
      frame = 0
      const bounds = section.getBoundingClientRect()
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return
      section.style.setProperty('--grass-scroll-y', `${-bounds.top}px`)
    }
    const requestSync = () => {
      if (!frame) frame = window.requestAnimationFrame(syncGrass)
    }

    syncGrass()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
    }
  }, [])

  return (
    <Section
      bg="groen"
      wydte="wyd"
      className={styles.section}
      sectionRef={sectionRef}
      style={{ '--grass-scroll-y': '0px' } as CSSProperties}
    >
      <strong className={styles.count}>{loading ? '…' : collectedCount}<span>/6</span></strong>

      <Reveal className={styles.headerReveal}>
        <header className={styles.header}>
          <p className={styles.kicker}>★ JOU LENTE BINGO ★</p>
          <h2>My Plakkaat versameling</h2>
        </header>
      </Reveal>

      <div
        className={styles.row}
        aria-label="Jou Lente Bingo-plakkaatversameling"
        onScroll={(event) => {
          if (event.currentTarget.scrollLeft > 12) {
            setPosterStripScrolled(true)
          }
        }}
      >
        {ALL_CHALLENGE_IDS.map((id, index) => {
          const challenge = CHALLENGES[id]
          const collected = progress[id].collected
          const wildcard = id === 'wildcard'
          return (
            <Reveal key={id} delay={index * 70}>
              <Link className={`${styles.poster} ${wildcard ? styles.wildcard : ''} ${collected ? styles.collected : styles.locked}`}
                to={`/woordjag?poster=${id}&reveal=1`} viewTransition
                aria-label={`${challenge.name}: ${collected ? 'versamel' : 'nog nie gevind nie'}. Wys leidraad.`}>
                <span className={styles.number}>0{challenge.number}</span>
                <img src={POSTERS[id]} alt="" />
                {!collected && <span className={styles.question} aria-hidden="true">{wildcard ? '🔒' : '?'}</span>}
                <span className={styles.name}>{challenge.name}</span>
              </Link>
            </Reveal>
          )
        })}
      </div>

      <p className={styles.intro}>Tik &rsquo;n plakkaat om direk na sy leidraad te gaan.</p>

      <p className={`${styles.scrollHint} ${posterStripScrolled ? styles.hintHidden : ''}`}>
        <span aria-hidden="true">&larr;</span>
        Sleep links en regs om al die plakkate te sien
        <span aria-hidden="true">&rarr;</span>
      </p>
    </Section>
  )
}
