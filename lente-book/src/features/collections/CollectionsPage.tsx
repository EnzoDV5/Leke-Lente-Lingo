import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import {
  doc,
  onSnapshot,
} from 'firebase/firestore'

import { useAuth } from '../auth/AuthContext'

import {
  ALL_CHALLENGE_IDS,
  CHALLENGES,
  CORE_CHALLENGE_IDS,
  type ChallengeId,
} from '../challenges/challengeConfig'

import {
  useChallengeProgress,
} from '../../hooks/useChallengeProgress'
import { useScrollSyncedBackground } from '../../hooks/useScrollSyncedBackground'

import JagKaart from './JagKaart'
import QrScanner from './QrScanner'
import CompactHero from '../../components/ui/CompactHero'
import Skeleton from '../../components/ui/Skeleton'

import styles from './CollectionsPage.module.css'
import { db } from '../../lib/firebase'
import { POSTER_IMAGES } from './posterAssets'
import lenteBingoTitelBeeld from '../../assets/elements/pages hero titles/LENTE BINGO.webp'

function PosterGridSkeleton() {
  return (
    <section
      className={`${styles.grid} ${styles.gridSkeleton}`}
      aria-label="Jou posters word gelaai"
      aria-busy="true"
    >
      {Array.from({ length: ALL_CHALLENGE_IDS.length }).map((_, index) => (
        <Skeleton
          key={index}
          className={styles.posterSkeleton}
          radius={20}
          delay={index * 90}
        />
      ))}
    </section>
  )
}

export default function CollectionsPage() {
  const collectionRef = useRef<HTMLElement | null>(null)
  const rewardRef = useRef<HTMLElement | null>(null)
  const { user } = useAuth()

  const navigate = useNavigate()

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  const {
    progress,
    collectedCount,
    wildcardUnlocked,
    loading,
    error,
  } = useChallengeProgress(user?.uid)
  const useMobileStaticBackground = window.matchMedia('(max-width: 700px)').matches
  useScrollSyncedBackground(!loading && !useMobileStaticBackground, collectionRef, rewardRef)

  const [scannerChallenge, setScannerChallenge] = useState<ChallengeId | null>(null)
  const [revealingPoster, setRevealingPoster] = useState<ChallengeId | null>(null)
  const [wildcardJoined, setWildcardJoined] = useState(false)
  const [wildcardCelebrating, setWildcardCelebrating] = useState(false)
  const [wildcardEntrance, setWildcardEntrance] = useState(false)
  const [completedHunters, setCompletedHunters] = useState(0)

  useEffect(() => {
    return onSnapshot(
      doc(db, 'stats', 'global'),
      (snapshot) => {
        const count = snapshot.data()?.completedHunters
        setCompletedHunters(typeof count === 'number' ? count : 0)
      },
      () => setCompletedHunters(0),
    )
  }, [])

  const newlyCollected =
    searchParams.get('collected')

  useEffect(() => {
    if (loading) return

    const isMobile = window.matchMedia('(max-width: 700px)').matches
    if (!isMobile) return

    if (!progress.wildcard.collected) {
      setWildcardJoined(false)
      setWildcardCelebrating(false)
      return
    }

    const wildcardJustCompleted = newlyCollected === 'wildcard'
    if (!wildcardJustCompleted) {
      setWildcardJoined(true)
      return
    }

    const scrollTimer = window.setTimeout(() => {
      rewardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 450)
    const celebrationTimer = window.setTimeout(() => {
      setWildcardCelebrating(true)
    }, 1400)
    const joinTimer = window.setTimeout(() => {
      setWildcardJoined(true)
      setWildcardCelebrating(false)
    }, 5400)

    return () => {
      window.clearTimeout(scrollTimer)
      window.clearTimeout(celebrationTimer)
      window.clearTimeout(joinTimer)
    }
  }, [loading, newlyCollected, progress.wildcard.collected])

  useEffect(() => {
    if (
      loading ||
      !wildcardUnlocked ||
      progress.wildcard.collected ||
      !newlyCollected ||
      !CORE_CHALLENGE_IDS.includes(newlyCollected as ChallengeId) ||
      !window.matchMedia('(max-width: 700px)').matches
    ) return

    const guideTimer = window.setTimeout(() => {
      rewardRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      })
    }, 3850)
    const revealTimer = window.setTimeout(() => setWildcardEntrance(true), 4350)

    return () => {
      window.clearTimeout(guideTimer)
      window.clearTimeout(revealTimer)
    }
  }, [loading, newlyCollected, progress.wildcard.collected, wildcardUnlocked])

  useEffect(() => {
    const reward = rewardRef.current
    if (!reward) return
    const poster = reward.querySelector<HTMLElement>(`.${styles.wildcardPoster}`)
    if (!poster) return
    const isMobile = window.matchMedia('(max-width: 700px)').matches
    if (!isMobile) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setWildcardEntrance(true)
        observer.unobserve(entry.target)
      },
      { rootMargin: '0px 0px -10% 0px', threshold: .08 },
    )

    observer.observe(poster)
    return () => observer.disconnect()
  }, [])

  const focusedPoster =
    (searchParams.get('collected') ?? searchParams.get('poster')) as ChallengeId | null

  const revealFocusedPoster =
    Boolean(searchParams.get('collected')) || searchParams.get('reveal') === '1'

  useEffect(() => {
    if (
      loading ||
      !focusedPoster ||
      !ALL_CHALLENGE_IDS.includes(focusedPoster)
    ) return

    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`poster-${focusedPoster}`)?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'center',
        })
    }, 250)

    const revealTimer = revealFocusedPoster
      ? window.setTimeout(() => setRevealingPoster(focusedPoster), 900)
      : 0
    const finishTimer = revealFocusedPoster
      ? window.setTimeout(() => setRevealingPoster(null), 3600)
      : 0

    return () => {
      window.clearTimeout(scrollTimer)
      window.clearTimeout(revealTimer)
      window.clearTimeout(finishTimer)
    }
  }, [focusedPoster, loading, revealFocusedPoster])

  useEffect(() => {
    const collection = collectionRef.current
    if (
      !collection ||
      loading ||
      !window.matchMedia('(max-width: 700px)').matches
    ) return

    const posters = Array.from(
      collection.querySelectorAll<HTMLElement>('[id^="poster-"]'),
    )

    posters.forEach((poster, index) => {
      poster.classList.add(styles.mobileScrollPoster)
      poster.style.setProperty('--mobile-poster-x', index % 2 === 0 ? '-18px' : '18px')
      poster.style.setProperty('--mobile-poster-angle', index % 2 === 0 ? '-1.2deg' : '1.2deg')
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add(styles.mobileScrollPosterActive)
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: .08,
        rootMargin: '0px 0px -7% 0px',
      },
    )

    posters.forEach((poster) => observer.observe(poster))

    return () => {
      observer.disconnect()
      posters.forEach((poster) => {
        poster.classList.remove(styles.mobileScrollPoster, styles.mobileScrollPosterActive)
        poster.style.removeProperty('--mobile-poster-x')
        poster.style.removeProperty('--mobile-poster-angle')
      })
    }
  }, [loading, wildcardJoined])

  const removeNotification = () => {
    const nextParams =
      new URLSearchParams(
        searchParams,
      )

    nextParams.delete('collected')

    setSearchParams(nextParams, {
      replace: true,
    })
  }

  return (
    <main className={styles.page}>
      <CompactHero
        compact
        className={styles.collectionHero}
        aboveKicker={
          <div className={styles.communityProgress}>
            <strong>{completedHunters.toLocaleString('af-ZA')}</strong>
            <span>Jagters klaar</span>
          </div>
        }
        kicker="Lente Book · 2026"
        title="Lente Bingo"
        titleImage={lenteBingoTitelBeeld}
        subtitle="Vind die posters soos jy deur Lentedag beweeg. Skan, speel en vul jou versameling."
      >
        <div
          className={
            styles.progressCard
          }
        >
          <div
            className={
              styles.progressNumber
            }
          >
            <strong>
              {collectedCount}
            </strong>

            <span>/ {ALL_CHALLENGE_IDS.length} versamel</span>
          </div>

          <div
            className={
              styles.progressTrack
            }
          >
            <span
              style={{
                width: `${
                  (collectedCount / ALL_CHALLENGE_IDS.length) *
                  100
                }%`,
              }}
            />
          </div>

        </div>
      </CompactHero>

      {newlyCollected &&
        CHALLENGES[
          newlyCollected as ChallengeId
        ] && (
          <section
            className={
              styles.successBanner
            }
          >
            <span>★</span>

            <div>
              <strong>
                {
                  CHALLENGES[
                    newlyCollected as ChallengeId
                  ].name
                }{' '}
                versamel!
              </strong>

              <p>
                Die poster is nou
                permanent in jou
                Lente Book-versameling.
              </p>
            </div>

            <button
              type="button"
              onClick={
                removeNotification
              }
            >
              ×
            </button>
          </section>
        )}

      <section
        className={
          styles.instructions
        }
      >
        <span
          className={
            styles.instructionIcon
          }
        >
          🗺️
        </span>

        <div>
          <h2>Hoe werk dit?</h2>

          <p>
            Kliek op ’n poster om dit om te
            draai en sy leidraad te lees.
            Gebruik “QR” agterop
            om jou kamera oop te maak.
          </p>
        </div>
      </section>

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}

      {loading ? (
        <PosterGridSkeleton />
      ) : (
        <section
          ref={collectionRef}
          className={`${styles.grid} ${progress.wildcard.collected ? styles.gridComplete : ''}`}
          aria-label="Jou posterversameling"
        >
          {CORE_CHALLENGE_IDS.map(
            (challengeId) => (
              <JagKaart
                key={challengeId}
                challenge={
                  CHALLENGES[
                    challengeId
                  ]
                }
                progress={
                  progress[challengeId]
                }
                wildcardLocked={
                  challengeId ===
                    'wildcard' &&
                  !wildcardUnlocked
                }
                onScan={() => setScannerChallenge(challengeId)}
                revealClue={
                  challengeId === focusedPoster &&
                  revealFocusedPoster && !progress[challengeId].collected
                }
                celebrate={challengeId === revealingPoster}
              />
            ),
          )}
          <div className={`${styles.desktopWildcard} ${wildcardUnlocked ? styles.desktopWildcardUnlocked : ''} ${progress.wildcard.collected ? styles.desktopWildcardCollected : ''} ${newlyCollected === 'wildcard' ? styles.desktopWildcardJoining : ''}`}>
            <span className={styles.desktopWildcardLabel}>
              {wildcardUnlocked ? '★ WILDCARD ONTSLUIT ★' : '★ DIE FINALE POSTER ★'}
            </span>
            <JagKaart
              challenge={CHALLENGES.wildcard}
              progress={progress.wildcard}
              wildcardLocked={!wildcardUnlocked}
              wildcardProgress={collectedCount}
              onScan={() => setScannerChallenge('wildcard')}
              revealClue={focusedPoster === 'wildcard' && revealFocusedPoster}
              celebrate={revealingPoster === 'wildcard'}
            />
          </div>
          {wildcardJoined && (
            <div className={styles.mobileWildcard}>
              <JagKaart
                challenge={CHALLENGES.wildcard}
                progress={progress.wildcard}
                wildcardLocked={!wildcardUnlocked}
                wildcardProgress={collectedCount}
                onScan={() => setScannerChallenge('wildcard')}
                revealClue={focusedPoster === 'wildcard' && revealFocusedPoster}
              />
            </div>
          )}
        </section>
      )}

      <section
        ref={rewardRef}
        className={`${styles.reward} ${
          wildcardUnlocked
            ? styles.rewardOpen
            : ''
        } ${wildcardEntrance ? styles.rewardEntrance : ''} ${wildcardCelebrating ? styles.rewardUnlocking : ''} ${wildcardJoined ? styles.rewardJoined : ''}`}
      >
        <div className={styles.rewardCard}>
        <div className={`${styles.wildcardPoster} ${!wildcardUnlocked ? styles.wildcardPosterLocked : ''}`}>
          <span className={styles.wildcardNumber}>0{CHALLENGES.wildcard.number}</span>
          <img src={POSTER_IMAGES.wildcard} alt="Wildcard-poster" />
          {!progress.wildcard.collected && (
            <span className={styles.wildcardLock} aria-label={wildcardUnlocked ? 'Wildcard-uitdaging gereed.' : `Wildcard gesluit. ${Math.min(collectedCount, CORE_CHALLENGE_IDS.length)} van ${CORE_CHALLENGE_IDS.length} versamel.`}>
              <span>🔒</span>
              <strong>{wildcardUnlocked ? 'UITDAGING GEREED' : `${Math.min(collectedCount, CORE_CHALLENGE_IDS.length)}/${CORE_CHALLENGE_IDS.length} versamel`}</strong>
            </span>
          )}
          <strong>{progress.wildcard.collected ? 'VERSAMEL!' : wildcardUnlocked ? 'SKEP OM TE VERSAMEL' : `${CORE_CHALLENGE_IDS.length} POSTERS BENODIG`}</strong>
        </div>

        <span className={styles.rewardLegacyIcon}>
          {wildcardUnlocked
            ? '🔓'
            : '🔒'}
        </span>

        <div className={styles.rewardCopy}>

          <h2>
            Maak jou eie scenario
          </h2>

          <p className={styles.rewardDescription}>
            {wildcardUnlocked
              ? progress.wildcard.collected
                ? 'Jou eie frase en woord het die Wildcard-poster onthul.'
                : 'Jy het die ander ses! Skep nou jou eie scenario en gee dit ’n nuwe woord om die Wildcard te verdien.'
              : 'Versamel ses posters om jou eie scenario te skep.'}
          </p>

          <p className={styles.rewardLegacyDescription}>
            {wildcardUnlocked
              ? progress.wildcard.collected
                ? 'Die Wildcard is nou permanent deel van jou versameling.'
                : 'Geen QR-kode is nodig nie. Maak die uitdaging oop en voltooi jou eie frase en woord.'
              : 'Versamel Merk Dit, Steel & Verbeter, Raai die Lingo, Kiekie die Oomblik, Challenge ’n Chommie en Stem.'}
          </p>
        </div>

        <button
          type="button"
          disabled={!wildcardUnlocked || progress.wildcard.collected}
          onClick={() =>
            navigate(
              '/challenge/wildcard',
            )
          }
        >
          {progress.wildcard.collected
            ? 'Wildcard versamel ✓'
            : wildcardUnlocked
              ? 'Skep my Wildcard'
              : `${collectedCount}/${CORE_CHALLENGE_IDS.length}`}
        </button>
        </div>
      </section>

      {scannerChallenge && scannerChallenge !== 'wildcard' && (
        <QrScanner expectedChallenge={scannerChallenge} onClose={() => setScannerChallenge(null)} />
      )}
    </main>
  )
}
