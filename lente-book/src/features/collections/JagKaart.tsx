import {
  useEffect,
  useState,
  type CSSProperties,
} from 'react'
import { Link } from 'react-router-dom'

import {
  CORE_CHALLENGE_IDS,
  type ChallengeDefinition,
} from '../challenges/challengeConfig'

import type {
  ChallengeProgress,
} from '../../hooks/useChallengeProgress'

import {
  POSTER_COLOURS,
  POSTER_IMAGES,
} from './posterAssets'

import styles from './JagKaart.module.css'

type JagKaartProps = {
  challenge: ChallengeDefinition
  progress: ChallengeProgress
  wildcardLocked: boolean
  wildcardProgress?: number
  onScan: () => void
  revealClue?: boolean
  celebrate?: boolean
}

export default function JagKaart({
  challenge,
  progress,
  wildcardLocked,
  wildcardProgress = 0,
  onScan,
  revealClue = false,
  celebrate = false,
}: JagKaartProps) {
  const [flipped, setFlipped] =
    useState(revealClue && !progress.collected)

  useEffect(() => {
    if (progress.collected) setFlipped(false)
  }, [progress.collected])

  const [imageFailed, setImageFailed] =
    useState(false)

  const locked =
    challenge.id === 'wildcard' &&
    wildcardLocked
  const canFlip = !locked || progress.collected

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
      className={`${styles.shell} ${challenge.id === 'wildcard' ? styles.wildcardShell : ''} ${progress.collected ? styles.collectedShell : ''} ${celebrate ? styles.collectedReveal : ''}`}
      style={cardStyle}
    >
      <div
        className={`${styles.card} ${
          flipped ? styles.flipped : ''
        }`}
        role={canFlip ? 'button' : undefined}
        tabIndex={canFlip ? 0 : -1}
        aria-label={progress.collected ? `${challenge.name}. ${flipped ? 'Wys poster' : 'Wys jou resultaat'}` : `${challenge.name}. ${flipped ? 'Wys poster' : 'Wys leidraad'}`}
        onClick={() => {
          if (canFlip) setFlipped((current) => !current)
        }}
        onKeyDown={(event) => {
          if (canFlip && (event.key === 'Enter' || event.key === ' ')) {
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
            {!imageFailed && (
              <img
                src={
                  POSTER_IMAGES[
                    challenge.id
                  ]
                }
                alt={`${challenge.name}-poster`}
                loading="lazy"
                decoding="async"
                onError={() =>
                  setImageFailed(true)
                }
              />
            )}

            {imageFailed && (
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
            )}
          </div>

          <span className={styles.posterNumber}>
            0{challenge.number}
          </span>

          {!progress.collected && !locked && (
            <span className={styles.tapPrompt}>
              <span className={styles.question}>?</span>
              <small>TAP</small>
            </span>
          )}

          {locked && (
            <span
              className={styles.lock}
              data-progress={`${Math.min(wildcardProgress, CORE_CHALLENGE_IDS.length)}/${CORE_CHALLENGE_IDS.length} versamel`}
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
            {progress.collected ? 'JOU RESULTAAT' : `LEIDRAAD 0${challenge.number}`}
          </p>

          <h2>{progress.collected ? 'So het jy dit verdien' : challenge.name}</h2>

          {progress.collected ? (
            <SavedResult challenge={challenge} progress={progress} />
          ) : (
            <p>{challenge.clue}</p>
          )}

          {locked && (
            <strong
              className={
                styles.lockMessage
              }
            >
              Versamel eers die ander ses.
            </strong>
          )}

          {!progress.collected && !locked && challenge.id !== 'wildcard' && (
            <button
              type="button"
              className={styles.backScanButton}
              onKeyDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onScan()
              }}
            >
              ▣ QR
            </button>
          )}

          {!locked && challenge.id === 'wildcard' && !progress.collected && (
            <Link
              className={styles.backScanButton}
              to="/challenge/wildcard"
              onKeyDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              ⚡ Skep my Wildcard
            </Link>
          )}
        </div>
      </div>

    </article>
  )
}

function SavedResult({
  challenge,
  progress,
}: {
  challenge: ChallengeDefinition
  progress: ChallengeProgress
}) {
  const result = progress.result

  if (!result) {
    return (
      <div className={styles.savedResult}>
        <span aria-hidden="true">✓</span>
        <strong>{challenge.name} voltooi</strong>
        <small>Jou oorspronklike resultaat is nie vir hierdie ouer inskrywing gestoor nie.</small>
      </div>
    )
  }

  if (result.kind === 'photo' && result.photoUrl) {
    return (
      <div className={`${styles.savedResult} ${styles.photoResult}`}>
        <img src={result.photoUrl} alt={result.word ? `Jou foto: ${result.word}` : 'Jou uitdagingfoto'} />
        <strong>{result.word}</strong>
      </div>
    )
  }

  if (result.kind === 'vote') {
    return (
      <div className={styles.savedResult}>
        <span aria-hidden="true">{result.voteValue === -1 ? '👎' : '👍'}</span>
        {result.phrase && <small className={styles.resultPhrase}>{result.phrase}</small>}
        <strong>{result.word}</strong>
        <small>{result.voteValue === -1 ? 'Jou afstem' : 'Jou stem'}</small>
      </div>
    )
  }

  return (
    <div className={styles.savedResult}>
      {result.phrase && <small className={styles.resultPhrase}>{result.phrase}</small>}
      {result.originalWord && <span className={styles.resultJourney}><i>{result.originalWord}</i><b>→</b></span>}
      <strong>{result.word ?? 'Uitdaging voltooi'}</strong>
      {result.partnerUsername && <small>Saam met {result.partnerUsername}</small>}
    </div>
  )
}
