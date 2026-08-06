import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

import {
  ALL_CHALLENGE_IDS,
  CHALLENGES,
  type ChallengeId,
} from '../challenges/challengeConfig'

import {
  useChallengeProgress,
} from '../../hooks/useChallengeProgress'

import {
  useLivePhrases,
} from '../../hooks/useLivePhrases'

import JagKaart from './JagKaart'

import styles from './Woordjag.module.css'

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
    allCollected,
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

  const [
    selectedPhrase,
    setSelectedPhrase,
  ] = useState('')

  const newlyCollected =
    searchParams.get('collected')

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

  const openSimulator = (
    challengeId: ChallengeId,
  ) => {
    if (
      challengeId === 'doop' ||
      challengeId === 'remix'
    ) {
      setSimulating(challengeId)
      return
    }

    navigate(
      `/scan/${challengeId}`,
    )
  }

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
      <header className={styles.hero}>
        <span className={styles.sparkOne}>
          ✦
        </span>

        <span className={styles.sparkTwo}>
          ✦
        </span>

        <p className={styles.kicker}>
          LENTE BOOK · 2026
        </p>

        <h1>DIE WOORDJAG</h1>

        <p>
          Vind die plakkate soos jy deur
          Lentedag beweeg. Skan, speel
          en vul jou versameling.
        </p>

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

          <span
            className={
              styles.progressMessage
            }
          >
            {allCollected
              ? 'Volledige stel! Die Wildcard is joune.'
              : wildcardUnlocked
                ? 'Die Wildcard is nou oop!'
                : `${
                    5 -
                    Math.min(
                      collectedCount,
                      5,
                    )
                  } voor die Wildcard ontsluit.`}
          </span>
        </div>
      </header>

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
            Tik “Wys leidraad” om die
            plakkaat om te draai.
            “Simuleer QR” doen presies
            wat die regte QR-kode by die
            fees sal doen.
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
          className={styles.grid}
          aria-label="Jou plakkaatversameling"
        >
          {ALL_CHALLENGE_IDS.map(
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
                onSimulate={() =>
                  openSimulator(
                    challengeId,
                  )
                }
              />
            ),
          )}
        </section>
      )}

      <section
        className={`${styles.reward} ${
          wildcardUnlocked
            ? styles.rewardOpen
            : ''
        }`}
      >
        <span>
          {wildcardUnlocked
            ? '🔓'
            : '🔒'}
        </span>

        <div>
          <p
            className={
              styles.rewardKicker
            }
          >
            DIE FINALE ONTSLUITING
          </p>

          <h2>
            Maak jou eie scenario
          </h2>

          <p>
            {wildcardUnlocked
              ? 'Jy het die kernstel voltooi. Skan nou die Wildcard om jou eie scenario en woord te skep.'
              : 'Versamel Doop Dit, Steel & Verbeter, Raai die Woord, Foto-doop en Daag ’n Maat Uit.'}
          </p>
        </div>

        <button
          type="button"
          disabled={!wildcardUnlocked}
          onClick={() =>
            navigate(
              '/scan/wildcard',
            )
          }
        >
          {wildcardUnlocked
            ? 'Open Wildcard →'
            : `${collectedCount}/5`}
        </button>
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
              Maak challenge oop →
            </button>
          </section>
        </div>
      )}
    </main>
  )
}