import {
  useEffect,
  useMemo,
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
  CHALLENGES,
  CORE_CHALLENGE_IDS,
  type ChallengeId,
} from '../challenges/challengeConfig'

import {
  useChallengeProgress,
} from '../../hooks/useChallengeProgress'

import {
  useLivePhrases,
} from '../../hooks/useLivePhrases'

import JagKaart from './JagKaart'
import QrScanner from './QrScanner'
import CompactHero from '../../components/ui/CompactHero'

import styles from './Woordjag.module.css'
import { db } from '../../lib/firebase'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

const AREA_NAMES: Record<
  string,
  string
> = {
  bathroom: 'Badkamer',
  smoking: 'Rookarea',
  bar: 'Kroeg',
  stages: 'Verhoë',
}

export default function Woordjag() {
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

  const {
    phrases,
    loading: phrasesLoading,
    error: phrasesError,
  } = useLivePhrases()

  const [
    simulating,
    setSimulating,
  ] = useState<ChallengeId | null>(
    null,
  )

  const [scannerOpen, setScannerOpen] = useState(false)
  useBodyScrollLock(Boolean(simulating))
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

  const [
    selectedPhrase,
    setSelectedPhrase,
  ] = useState('')

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
    const reward = rewardRef.current
    if (!reward) return
    const poster = reward.querySelector<HTMLElement>(`.${styles.wildcardPoster}`)
    if (!poster) return
    const isMobile = window.matchMedia('(max-width: 700px)').matches
    let lastScrollY = window.scrollY
    let scrollDirection = 0
    let frame = 0

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        if (entry.isIntersecting) {
          if (!isMobile || scrollDirection >= 0) setWildcardEntrance(true)
          return
        }

        const viewportBottom = entry.rootBounds?.bottom ?? window.innerHeight
        if (entry.boundingClientRect.top >= viewportBottom) {
          setWildcardEntrance(false)
        }
      },
      { rootMargin: '0px 0px -32% 0px', threshold: 0 },
    )

    observer.observe(poster)
    const handleScroll = () => {
      if (!isMobile) return
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const nextScrollY = window.scrollY
        const delta = nextScrollY - lastScrollY
        lastScrollY = nextScrollY
        if (Math.abs(delta) < .5) return
        scrollDirection = delta > 0 ? 1 : -1
        const rect = poster.getBoundingClientRect()

        if (delta < 0) {
          if (rect.top >= window.innerHeight * .34) {
            setWildcardEntrance(false)
          }
          return
        }

        const isNearViewport = rect.bottom > 0 && rect.top < window.innerHeight
        if (!isNearViewport) return

        setWildcardEntrance(true)
      })
    }

    let touchStartY = 0
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (!isMobile) return
      const touchY = event.touches[0]?.clientY ?? touchStartY
      if (touchY > touchStartY + 2) {
        scrollDirection = -1
        const rect = poster.getBoundingClientRect()
        if (rect.top >= window.innerHeight * .34) {
          setWildcardEntrance(false)
        }
      }
      touchStartY = touchY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const focusedPoster =
    searchParams.get('poster') as ChallengeId | null

  const revealFocusedPoster =
    searchParams.get('reveal') === '1'

  useEffect(() => {
    if (
      loading ||
      !focusedPoster ||
      !CORE_CHALLENGE_IDS.includes(focusedPoster)
    ) return

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`poster-${focusedPoster}`)
        ?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'center',
        })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [focusedPoster, loading])

  useEffect(() => {
    const collection = collectionRef.current
    if (!collection || loading) return

    let frame = 0
    const syncGrass = () => {
      frame = 0
      const bounds = collection.getBoundingClientRect()
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return
      collection.style.setProperty('--grass-scroll-y', `${-bounds.top}px`)
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
  }, [loading])

  useEffect(() => {
    const reward = rewardRef.current
    if (!reward) return

    let frame = 0
    const syncGrass = () => {
      frame = 0
      const bounds = reward.getBoundingClientRect()
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return
      reward.style.setProperty('--grass-scroll-y', `${-bounds.top}px`)
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

  const needsPhrase =
    simulating === 'doop' ||
    simulating === 'remix'

  useEffect(() => {
    if (
      !selectedPhrase &&
      phrases[0]
    ) {
      setSelectedPhrase(
        phrases[0].id,
      )
    }
  }, [phrases, selectedPhrase])

  const phraseGroups = useMemo(
    () =>
      phrases.reduce<
        Record<string, typeof phrases>
      >((groups, phrase) => {
        if (!groups[phrase.area]) {
          groups[phrase.area] = []
        }

        groups[phrase.area].push(
          phrase,
        )

        return groups
      }, {}),
    [phrases],
  )

  const simulateBoardQr = () => {
    if (
      !simulating ||
      !selectedPhrase
    ) {
      return
    }

    const phrase = phrases.find(
      (item) =>
        item.id === selectedPhrase,
    )

    if (!phrase) return

    const query =
      new URLSearchParams({
        phrase: phrase.id,
        area: phrase.area,
      })

    navigate(
      `/scan/${simulating}?${query.toString()}`,
    )
  }

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
        subtitle="Vind die plakkate soos jy deur Lentedag beweeg. Skan, speel en vul jou versameling."
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

            <span>/ 6 versamel</span>
          </div>

          <div
            className={
              styles.progressTrack
            }
          >
            <span
              style={{
                width: `${
                  (collectedCount / 6) *
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
                Die plakkaat is nou
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
            Tik op ’n plakkaat om dit om te
            draai en sy leidraad te lees.
            Gebruik “Skandeer QR” agterop
            om jou kamera oop te maak.
          </p>
        </div>
      </section>

      {(error || phrasesError) && (
        <p className={styles.error}>
          {error || phrasesError}
        </p>
      )}

      {loading ? (
        <p className={styles.loading}>
          Jou plakkate word
          ontwikkel...
        </p>
      ) : (
        <section
          ref={collectionRef}
          className={styles.grid}
          aria-label="Jou plakkaatversameling"
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
                onScan={() => setScannerOpen(true)}
                revealClue={
                  challengeId === focusedPoster &&
                  revealFocusedPoster
                }
              />
            ),
          )}
          <div className={styles.desktopWildcard}>
            <JagKaart
              challenge={CHALLENGES.wildcard}
              progress={progress.wildcard}
              wildcardLocked={!wildcardUnlocked}
              wildcardProgress={collectedCount}
              onScan={() => setScannerOpen(true)}
              revealClue={focusedPoster === 'wildcard' && revealFocusedPoster}
            />
          </div>
          {wildcardJoined && (
            <div className={styles.mobileWildcard}>
              <JagKaart
                challenge={CHALLENGES.wildcard}
                progress={progress.wildcard}
                wildcardLocked={!wildcardUnlocked}
                wildcardProgress={collectedCount}
                onScan={() => setScannerOpen(true)}
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
        <div className={styles.wildcardPoster}>
          <span className={styles.wildcardNumber}>06</span>
          <img src="/posters/wildcard.webp" alt="Wildcard-plakkaat" />
          {!progress.wildcard.collected && (
            <span className={styles.wildcardLock} aria-label={wildcardUnlocked ? 'Wildcard-uitdaging gereed.' : `Wildcard gesluit. ${Math.min(collectedCount, 5)} van 5 versamel.`}>
              <span>🔒</span>
              <strong>{wildcardUnlocked ? 'UITDAGING GEREED' : `${Math.min(collectedCount, 5)}/5 versamel`}</strong>
            </span>
          )}
          <strong>{progress.wildcard.collected ? 'VERSAMEL!' : wildcardUnlocked ? 'SKEP OM TE VERSAMEL' : '5 PLAKKATE BENODIG'}</strong>
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
                ? 'Jou eie frase en woord het die Wildcard-plakkaat onthul.'
                : 'Jy het die ander vyf! Skep nou jou eie scenario en gee dit ’n nuwe woord om die Wildcard te verdien.'
              : 'Versamel vyf plakkate om jou eie scenario te skep.'}
          </p>

          <p className={styles.rewardLegacyDescription}>
            {wildcardUnlocked
              ? progress.wildcard.collected
                ? 'Die Wildcard is nou permanent deel van jou versameling.'
                : 'Geen QR-kode is nodig nie. Maak die uitdaging oop en voltooi jou eie frase en woord.'
              : 'Versamel Doop Dit, Steel & Verbeter, Raai die Woord, Foto-doop en Daag ’n Maat Uit.'}
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
              : `${collectedCount}/5`}
        </button>
        </div>
      </section>

      {simulating && (
        <div
          className={
            styles.modalBackdrop
          }
          onMouseDown={() =>
            setSimulating(null)
          }
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className={styles.close}
              aria-label="Maak toe"
              onClick={() =>
                setSimulating(null)
              }
            >
              ×
            </button>

            <span
              className={styles.fakeQr}
            >
              ▦
            </span>

            <p
              className={
                styles.modalKicker
              }
            >
              QR-SIMULATOR
            </p>

            <h2 id="qr-title">
              {
                CHALLENGES[
                  simulating
                ].name
              }
            </h2>

            <p>
              Kies watter bord en frase
              hierdie toets-QR moet
              voorstel.
            </p>

            {needsPhrase && (
              <label
                className={
                  styles.selectLabel
                }
              >
                Kies ’n regte
                Firestore-frase

                <select
                  value={selectedPhrase}
                  onChange={(event) =>
                    setSelectedPhrase(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    phrasesLoading ||
                    phrases.length ===
                      0
                  }
                >
                  {Object.entries(
                    phraseGroups,
                  ).map(
                    ([
                      area,
                      areaPhrases,
                    ]) => (
                      <optgroup
                        key={area}
                        label={
                          AREA_NAMES[
                            area
                          ] ?? area
                        }
                      >
                        {areaPhrases.map(
                          (phrase) => (
                            <option
                              key={
                                phrase.id
                              }
                              value={
                                phrase.id
                              }
                            >
                              {
                                phrase.text
                              }
                            </option>
                          ),
                        )}
                      </optgroup>
                    ),
                  )}
                </select>
              </label>
            )}

            {!phrasesLoading &&
              needsPhrase &&
              phrases.length === 0 && (
                <p
                  className={
                    styles.modalError
                  }
                >
                  Daar is nog geen
                  aktiewe frases in
                  Firestore nie.
                </p>
              )}

            <button
              type="button"
              className={
                styles.openButton
              }
              disabled={
                needsPhrase &&
                !selectedPhrase
              }
              onClick={
                simulateBoardQr
              }
            >
              Maak challenge oop
            </button>
          </section>
        </div>
      )}

      {scannerOpen && (
        <QrScanner onClose={() => setScannerOpen(false)} />
      )}
    </main>
  )
}
