import {
  useState,
  type CSSProperties,
} from 'react'

import type {
  ChallengeDefinition,
  ChallengeId,
} from '../challenges/challengeConfig'

import type {
  ChallengeProgress,
} from '../../hooks/useChallengeProgress'

import styles from './JagKaart.module.css'

const POSTER_IMAGES: Record<
  ChallengeId,
  string
> = {
  doop: '/posters/doop-dit.webp',
  remix:
    '/posters/steel-en-verbeter.webp',
  guess:
    '/posters/raai-die-woord.webp',
  photo: '/posters/foto-doop.webp',
  friend:
    '/posters/daag-n-maat-uit.webp',
  wildcard: '/posters/wildcard.webp',
}

const POSTER_COLOURS: Record<
  ChallengeId,
  string
> = {
  doop: '#ef321d',
  remix: '#20c84b',
  guess: '#ffca18',
  photo: '#2858df',
  friend: '#ff1977',
  wildcard: '#8334be',
}

type JagKaartProps = {
  challenge: ChallengeDefinition
  progress: ChallengeProgress
  wildcardLocked: boolean
  wildcardProgress?: number
  onScan: () => void
  revealClue?: boolean
}

export default function JagKaart({
  challenge,
  progress,
  wildcardLocked,
  wildcardProgress = 0,
  onScan,
  revealClue = false,
}: JagKaartProps) {
  const [flipped, setFlipped] =
    useState(revealClue)

  const [imageFailed, setImageFailed] =
    useState(false)

  const locked =
    challenge.id === 'wildcard' &&
    wildcardLocked

  const rotation =
    ((challenge.number * 5) % 7) - 3

  const cardStyle = {
    '--poster-colour':
      POSTER_COLOURS[challenge.id],

    '--poster-tilt':
      `${rotation}deg`,

    '--poster-counter-tilt':
      `${rotation * -0.25}deg`,
  } as CSSProperties

  return (
    <article
      id={`poster-${challenge.id}`}
      className={`${styles.shell} ${challenge.id === 'wildcard' ? styles.wildcardShell : ''}`}
      style={cardStyle}
    >
      <div
        className={`${styles.card} ${
          flipped ? styles.flipped : ''
        }`}
        role="button"
        tabIndex={0}
        aria-label={`${challenge.name}. ${flipped ? 'Wys plakkaat' : 'Wys leidraad'}`}
        onClick={() => setFlipped((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setFlipped((current) => !current)
          }
        }}
      >
        <div className={styles.front}>
          <span
            className={styles.tape}
            aria-hidden="true"
          />

          <div
            className={`${styles.artwork} ${
              !progress.collected
                ? styles.uncollected
                : ''
            }`}
          >
            <div className={styles.fallback}>
              <span
                className={
                  styles.posterIcon
                }
              >
                {challenge.icon}
              </span>

              <strong>
                {challenge.name}
              </strong>

              <small>
                LENTE BOOK · 2026
              </small>
            </div>

            {!imageFailed && (
              <img
                src={
                  POSTER_IMAGES[
                    challenge.id
                  ]
                }
                alt={`${challenge.name}-plakkaat`}
                onError={() =>
                  setImageFailed(true)
                }
              />
            )}
          </div>

          <span className={styles.posterNumber}>
            0{challenge.number}
          </span>

          {!progress.collected && !locked && (
            <span
              className={styles.question}
            >
              ?
            </span>
          )}

          {locked && (
            <span
              className={styles.lock}
              data-progress={`${Math.min(wildcardProgress, 5)}/5 versamel`}
            >
              🔒
            </span>
          )}

          {progress.collected && (
            <span className={styles.stamp}>
              VERSAMEL!
            </span>
          )}

        </div>

        <div className={styles.back}>
          <span
            className={styles.backIcon}
          >
            {challenge.icon}
          </span>

          <p className={styles.eyebrow}>
            LEIDRAAD 0{challenge.number}
          </p>

          <h2>{challenge.name}</h2>

          <p>{challenge.clue}</p>

          {locked && (
            <strong
              className={
                styles.lockMessage
              }
            >
              Versamel eers die ander vyf.
            </strong>
          )}

          {!locked && (
            <button
              type="button"
              className={styles.backScanButton}
              onKeyDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onScan()
              }}
            >
              ▣ Skandeer QR
            </button>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        <div>
          <strong>
            {challenge.name}
          </strong>

          <span>
            {progress.collected
              ? 'In jou versameling'
              : locked
                ? 'Nog gesluit'
                : 'Nog nie versamel nie'}
          </span>
        </div>

        <span
          className={
            progress.collected
              ? styles.statusDone
              : styles.statusOpen
          }
        >
          {progress.collected
            ? '✓'
            : locked
              ? '🔒'
              : `0${challenge.number}`}
        </span>
      </div>

    </article>
  )
}
