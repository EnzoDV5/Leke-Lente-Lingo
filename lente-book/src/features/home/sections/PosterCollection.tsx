import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Section from '../../../components/ui/Section'
import Reveal from '../../../components/ui/Reveal'
import Skeleton from '../../../components/ui/Skeleton'
import { useChallengeProgress } from '../../../hooks/useChallengeProgress'
import { useAuth } from '../../auth/AuthContext'
import { ALL_CHALLENGE_IDS, CHALLENGES, type ChallengeId } from '../../challenges/challengeConfig'
import { POSTER_COLOURS, POSTER_IMAGES } from '../../collections/posterAssets'
import cardElement from '../../../assets/elements/poster elements/card.webp'
import diceOneElement from '../../../assets/elements/poster elements/dice 1.webp'
import diceTwoElement from '../../../assets/elements/poster elements/dice 2.webp'
import challengeChommiePoster from '../../../assets/elements/posters/challenge n chommie@2x.webp'
import merkDitPoster from '../../../assets/elements/posters/merk dit poster@2x.webp'
import raaiDieWoordPoster from '../../../assets/elements/posters/raai die woord@2x.webp'
import steelVerbeterPoster from '../../../assets/elements/posters/steel en verbeter poster@2x.webp'
import wildKaartPoster from '../../../assets/elements/posters/wild kaart poster@2x.webp'
import styles from './PosterCollection.module.css'

type PosterCollectionVars = CSSProperties & {
  '--poster-progress-card': string
}

const HOME_POSTER_IMAGES: Record<ChallengeId, string> = {
  ...POSTER_IMAGES,
  doop: merkDitPoster,
  remix: steelVerbeterPoster,
  guess: raaiDieWoordPoster,
  friend: challengeChommiePoster,
  wildcard: wildKaartPoster,
}

function PosterThumb({ id }: { id: ChallengeId }) {
  const [imageFailed, setImageFailed] = useState(false)
  const challenge = CHALLENGES[id]

  if (imageFailed) {
    return (
      <div className={styles.fallback}>
        <strong>{challenge.name}</strong>
      </div>
    )
  }

  return (
    <img
      src={HOME_POSTER_IMAGES[id]}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
    />
  )
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
      style={{
        '--grass-scroll-y': '0px',
        '--poster-progress-card': `url(${cardElement})`,
      } as PosterCollectionVars}
    >
      <div className={styles.progressCluster} aria-label={`${collectedCount} van 6 posters versamel`}>
        <img className={`${styles.dice} ${styles.diceOne}`} src={diceOneElement} alt="" aria-hidden="true" />
        <strong className={styles.count}>
          {loading
            ? <Skeleton width="1.1rem" height="1.15rem" radius={5} className={styles.countSkeleton} />
            : collectedCount}
          <span>/6</span>
        </strong>
        <img className={`${styles.dice} ${styles.diceTwo}`} src={diceTwoElement} alt="" aria-hidden="true" />
      </div>

      <Reveal className={styles.headerReveal}>
        <header className={styles.header}>
          <p className={styles.kicker}>★ JOU LENTE BINGO ★</p>
          <h2>My Poster versameling</h2>
        </header>
      </Reveal>

      <div
        className={styles.row}
        aria-label="Jou Lente Bingo-posterversameling"
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
                style={{ '--poster-colour': POSTER_COLOURS[id] } as CSSProperties}
                to={`/woordjag?poster=${id}&reveal=1`} viewTransition
                aria-label={`${challenge.name}: ${collected ? 'versamel' : 'nog nie gevind nie'}. Wys leidraad.`}>
                <span className={styles.number}>0{challenge.number}</span>
                <PosterThumb id={id} />
                {!collected && <span className={styles.question} aria-hidden="true">{wildcard ? '🔒' : '?'}</span>}
                <span className={styles.name}>{challenge.name}</span>
              </Link>
            </Reveal>
          )
        })}
      </div>

      <p className={styles.intro}>Tik &rsquo;n poster om direk na sy leidraad te gaan.</p>

      <p className={`${styles.scrollHint} ${posterStripScrolled ? styles.hintHidden : ''}`}>
        <span aria-hidden="true">&larr;</span>
        Sleep links en regs om al die posters te sien
        <span aria-hidden="true">&rarr;</span>
      </p>
    </Section>
  )
}
