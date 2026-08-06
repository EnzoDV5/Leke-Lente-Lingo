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
  onSimulate: () => void
}

export default function JagKaart({
  challenge,
  progress,
  wildcardLocked,
  onSimulate,
}: JagKaartProps) {
  const [flipped, setFlipped] =
    useState(false)

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
      `${rotation * -1}deg`,
  } as CSSProperties

  return (
    <article
      className={styles.shell}
      style={cardStyle}
    >
      <div
        className={`${styles.card} ${
          flipped ? styles.flipped : ''
        }`}
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
                  styles.posterNumber
                }
              >
                0{challenge.number}
              </span>

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

          {!progress.collected && (
            <span
              className={styles.question}
            >
              ?
            </span>
          )}

          {locked && (
            <span className={styles.lock}>
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

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.clueButton}
          onClick={() =>
            setFlipped(
              (current) => !current,
            )
          }
        >
          {flipped
            ? 'Wys plakkaat'
            : 'Wys leidraad'}
        </button>

        <button
          type="button"
          className={styles.scanButton}
          onClick={onSimulate}
        >
          ▣ Simuleer QR
        </button>
      </div>
    </article>
  )
}