import {
  useState,
} from 'react'

import {
  useLeaderboard,
  type LeaderboardWord,
} from '../../../hooks/useLeaderboard'

import styles from './Leaderboard.module.css'

type Mode = 'top' | 'worst'

type PodiumItem = {
  rank: number
  word?: LeaderboardWord
}

function isImage(value: string) {
  return value.startsWith('http://') ||
    value.startsWith('https://')
}

function Avatar({
  word,
}: {
  word: LeaderboardWord
}) {
  if (
    isImage(word.createdByAvatar)
  ) {
    return (
      <img
        src={word.createdByAvatar}
        alt={word.createdByUsername}
        className={styles.avatarImage}
      />
    )
  }

  return (
    <span className={styles.avatarEmoji}>
      {word.createdByAvatar || '🌼'}
    </span>
  )
}

export default function Leaderboard() {
  const [mode, setMode] =
    useState<Mode>('top')

  const {
    topWords,
    worstWords,
    totalVotes,
    loading,
    error,
  } = useLeaderboard()

  const selectedWords =
    mode === 'top'
      ? topWords
      : worstWords

  /*
   * The podium is displayed as:
   * second, first, third.
   */
  const podium: PodiumItem[] = [
    {
      rank: 2,
      word: selectedWords[1],
    },
    {
      rank: 1,
      word: selectedWords[0],
    },
    {
      rank: 3,
      word: selectedWords[2],
    },
  ]

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>
              ★ Regstreeks uit Firestore ★
            </p>

            <h2>
              Die Woord-
              <br />
              Podium
            </h2>
          </div>

          <div className={styles.liveTotal}>
            <span className={styles.liveDot} />

            <strong>
              {totalVotes.toLocaleString(
                'af-ZA',
              )}
            </strong>

            <span>Live votes</span>
          </div>
        </header>

        <div className={styles.tabs}>
          <button
            className={
              mode === 'top'
                ? styles.activeTab
                : ''
            }
            onClick={() =>
              setMode('top')
            }
          >
            🏆 Top woorde
          </button>

          <button
            className={
              mode === 'worst'
                ? styles.activeTab
                : ''
            }
            onClick={() =>
              setMode('worst')
            }
          >
            🫠 Swakste woorde
          </button>
        </div>

        {loading ? (
          <p className={styles.message}>
            Die podium word gebou...
          </p>
        ) : (
          <div className={styles.podium}>
            {podium.map(
              ({ rank, word }) => (
                <article
                  key={rank}
                  className={`${styles.podiumCard} ${
                    styles[
                      `rank${rank}`
                    ]
                  }`}
                >
                  <div
                    className={
                      styles.medal
                    }
                  >
                    {rank === 1
                      ? '👑'
                      : `#${rank}`}
                  </div>

                  {word ? (
                    <>
                      <div
                        className={
                          styles.avatar
                        }
                      >
                        <Avatar
                          word={word}
                        />
                      </div>

                      <h3>{word.text}</h3>

                      <p
                        className={
                          styles.username
                        }
                      >
                        {
                          word.createdByUsername
                        }
                      </p>

                      <div
                        className={
                          styles.voteTotals
                        }
                      >
                        <span>
                          👍 {word.upVotes}
                        </span>

                        <span>
                          👎 {word.downVotes}
                        </span>
                      </div>

                      <strong
                        className={
                          styles.score
                        }
                      >
                        {word.score > 0
                          ? '+'
                          : ''}
                        {word.score}
                      </strong>
                    </>
                  ) : (
                    <p
                      className={
                        styles.empty
                      }
                    >
                      Hierdie plek wag vir
                      ’n woord.
                    </p>
                  )}

                  <div
                    className={
                      styles.podiumBase
                    }
                  >
                    {rank}
                  </div>
                </article>
              ),
            )}
          </div>
        )}

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <p className={styles.explanation}>
          Die ranglys verander onmiddellik
          wanneer iemand ’n 👍 of 👎 gee.
        </p>
      </div>
    </section>
  )
}