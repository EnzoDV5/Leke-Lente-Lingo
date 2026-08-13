import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { frases } from '../../lib/mockData'
import {
  addWord,
  setWordVote,
} from '../../lib/wordService'

import {
  useLiveWords,
  type LiveWord,
} from '../../hooks/useLiveWords'

import {
  useAuth,
} from '../auth/AuthContext'

import type { VoteValue } from '../../types'

import styles from './FraseView.module.css'
import CompactHero from '../../components/ui/CompactHero'
import Skeleton from '../../components/ui/Skeleton'
import lentedagSecondaryLogo from '../../assets/elements/LENTEDAG-logo2.webp'
import {
  fallbackProfileAvatar,
  resolveProfileAvatar,
} from '../../lib/profileAvatars'
import { completeChallenge } from '../../lib/challengeProgress'

type DisplayWord = LiveWord & { isDummy?: boolean }

function WoordLysSkeleton() {
  return (
    <ul className={styles.woordLys} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => {
        const delay = index * 65
        return (
          <li key={index} className={styles.woordItem}>
            <Skeleton width="1.6rem" height="1rem" radius={5} delay={delay} />
            <Skeleton circle width={58} height={58} delay={delay + 20} />
            <div className={styles.woordInfo}>
              <Skeleton width={`${58 - (index % 3) * 8}%`} height="1.1rem" radius={6} delay={delay + 40} />
              <Skeleton width={`${30 - (index % 2) * 6}%`} height=".7rem" radius={6} delay={delay + 60} style={{ marginTop: '.4rem' }} />
            </div>
            <Skeleton circle width={40} height={40} delay={delay + 80} />
            <Skeleton width={104} height={38} radius={999} delay={delay + 100} />
          </li>
        )
      })}
    </ul>
  )
}

export default function FraseView() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const focusedWordId = searchParams.get('word')

  const phrase = frases.find(
    (item) => item.id === id,
  )

  const {
    user,
    profile,
  } = useAuth()

  const {
    words,
    loading,
    error: liveError,
  } = useLiveWords(
    id,
    user?.uid,
  )

  const [newWord, setNewWord] =
    useState('')

  const [remixWord, setRemixWord] =
    useState<LiveWord | null>(null)

  const [submitting, setSubmitting] =
    useState(false)

  const [actionError, setActionError] =
    useState('')

  const [dummyVotes, setDummyVotes] = useState<Record<string, VoteValue | null>>({})
  const [remixLeaving, setRemixLeaving] = useState(false)
  const [pendingNewWordId, setPendingNewWordId] = useState<string | null>(null)
  const [newlyCreatedWordId, setNewlyCreatedWordId] = useState<string | null>(null)
  const inputSectionRef = useRef<HTMLDivElement>(null)
  const wordInputRef = useRef<HTMLInputElement>(null)
  const focusedWordScrolledRef = useRef<string | null>(null)

  const allWords = useMemo<DisplayWord[]>(() => {
    if (!phrase) return words

    const dummyWords: DisplayWord[] = phrase.woorde.map((word, index) => {
      const currentVote = dummyVotes[word.id] ?? null
      const downVotes = 4 + ((index * 7) % 24) + (currentVote === -1 ? 1 : 0)
      const upVotes = word.stemme + (currentVote === 1 ? 1 : 0)

      return {
        id: word.id,
        text: word.woord,
        normalisedText: word.woord.toLocaleLowerCase('af-ZA'),
        phraseId: phrase.id,
        phraseText: phrase.beskrywing,
        area: phrase.area,
        createdByUid: `dummy-${word.handle}`,
        createdByUsername: word.handle,
        createdByAvatar: '',
        isRemix: Boolean(word.verbeterVan),
        parentWordId: null,
        parentWordText: word.verbeterVan ?? null,
        rootWordId: null,
        createdAt: null,
        upVotes,
        downVotes,
        score: upVotes - downVotes,
        currentUserVote: currentVote,
        isDummy: true,
      }
    })

    return [...words, ...dummyWords].sort((a, b) => b.score - a.score)
  }, [dummyVotes, phrase, words])

  useEffect(() => {
    if (
      !pendingNewWordId ||
      !allWords.some((word) => word.id === pendingNewWordId)
    ) return

    const newWordId = pendingNewWordId
    const frame = window.requestAnimationFrame(() => {
      setNewlyCreatedWordId(newWordId)
      document.getElementById(`word-${newWordId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      setPendingNewWordId(null)
    })
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [allWords, pendingNewWordId])

  useEffect(() => {
    if (!newlyCreatedWordId) return
    const timer = window.setTimeout(() => setNewlyCreatedWordId(null), 3200)
    return () => window.clearTimeout(timer)
  }, [newlyCreatedWordId])

  useEffect(() => {
    if (!focusedWordId) {
      focusedWordScrolledRef.current = null
      return
    }

    if (
      loading ||
      focusedWordScrolledRef.current === focusedWordId
    ) return

    const focusedWord = document.getElementById(`word-${focusedWordId}`)
    if (!focusedWord) return

    focusedWordScrolledRef.current = focusedWordId

    const frame = window.requestAnimationFrame(() => {
      focusedWord.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [focusedWordId, loading])

  if (!phrase) {
    return (
      <div className={styles.wrap}>
        <Link
          to="/woordeboek"
          className={styles.terug}
        >
          <span aria-hidden="true">←</span> Terug na Woordeboek
        </Link>

        <p className={styles.leeg}>
          Hierdie frase bestaan nie.
        </p>
      </div>
    )
  }

  const area = phrase.area

  const submitWord = async () => {
    if (!user || !profile) {
      setActionError(
        'Jy moet eers aanmeld.',
      )

      return
    }

    if (!newWord.trim()) return

    if (
      remixWord &&
      newWord.trim().toLocaleLowerCase('af-ZA') ===
        remixWord.text.trim().toLocaleLowerCase('af-ZA')
    ) {
      setActionError('Verander eers die woord om jou verbetering in te sit.')
      return
    }

    setSubmitting(true)
    setActionError('')

    try {
      const createdWordId = await addWord({
        text: newWord,

        phraseId: phrase.id,
        phraseText:
          phrase.beskrywing,
        area,

        user,
        profile,

        parentWord: remixWord
          ? {
              id: remixWord.id,
              text: remixWord.text,
              rootWordId:
                remixWord.rootWordId,
            }
          : null,
      })

      await completeChallenge(
        user.uid,
        remixWord ? 'remix' : 'doop',
        false,
        remixWord
          ? {
              kind: 'remix',
              word: newWord.trim(),
              originalWord: remixWord.text,
              phrase: phrase.beskrywing,
              area,
              itemId: createdWordId,
            }
          : {
              kind: 'word',
              word: newWord.trim(),
              phrase: phrase.beskrywing,
              area,
              itemId: createdWordId,
            },
      )

      setNewWord('')
      setRemixWord(null)
      setPendingNewWordId(createdWordId)
    } catch (error) {
      console.error(
        'Add word error:',
        error,
      )

      setActionError(
        error instanceof Error
          ? error.message
          : 'Ons kon nie jou woord insit nie.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const vote = async (
    word: DisplayWord,
    value: VoteValue,
  ) => {
    if (!user || !profile) return

    if (word.isDummy) {
      setDummyVotes((current) => ({
        ...current,
        [word.id]: current[word.id] === value ? null : value,
      }))
      return
    }

    setActionError('')

    try {
      await setWordVote({
        wordId: word.id,
        phraseId: phrase.id,

        user,
        username: profile.username,

        value,

        currentVote:
          word.currentUserVote,
      })

      if (word.currentUserVote !== value) {
        await completeChallenge(
          user.uid,
          'vote',
          false,
          {
            kind: 'vote',
            word: word.text,
            phrase: phrase.beskrywing,
            area,
            itemId: word.id,
            voteValue: value,
          },
        )
      }
    } catch (error) {
      console.error(
        'Vote error:',
        error,
      )

      setActionError(
        'Ons kon nie jou stem stoor nie.',
      )
    }
  }

  const startRemix = (
    word: DisplayWord,
  ) => {
    setRemixLeaving(false)
    setRemixWord(word)
    setNewWord(word.text)

    window.requestAnimationFrame(() => {
      inputSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      window.setTimeout(() => {
        const input = wordInputRef.current
        if (!input) return
        input.focus({ preventScroll: true })
        const end = input.value.length
        input.setSelectionRange(end, end)
      }, 420)
    })
  }

  const cancelRemix = () => {
    if (remixLeaving) return
    setRemixLeaving(true)
    window.setTimeout(() => {
      setRemixWord(null)
      setNewWord('')
      setRemixLeaving(false)
    }, 360)
  }

  return (
    <section className={styles.page}>
      <CompactHero
        kicker="Die frase"
        title={phrase.beskrywing}
        statement
        detail
        topAction={(
          <Link to="/woordeboek" viewTransition className={styles.heroTerug}>
            <span aria-hidden="true" />
            Terug na Woordeboek
          </Link>
        )}
      >
        <div className={styles.wordCount} aria-label={`${allWords.length} woorde uitgedink`}>
          <span className={styles.countBolt} aria-hidden="true">⚡</span>
          <strong>{allWords.length}</strong>
          <span>
            <b>WOORDE</b>
            <small>UITGEDINK</small>
          </span>
        </div>
      </CompactHero>

      <div className={styles.wrap}>
        <div ref={inputSectionRef} className={styles.invoer} data-scroll-reveal="scale">
        <label className={`${styles.etiket} ${remixWord ? styles.remixEtiket : ''} ${remixLeaving ? styles.remixLeaving : ''}`}>
          {remixWord ? (
            <>
              <img
                className={`${styles.remixCreatorAvatar} ${remixWord.createdByUsername === '@lentedag' ? styles.brandRemixAvatar : ''}`}
                src={
                  remixWord.createdByUsername === '@lentedag'
                    ? lentedagSecondaryLogo
                    : resolveProfileAvatar(remixWord.createdByAvatar) ??
                      fallbackProfileAvatar(remixWord.createdByUid || remixWord.createdByUsername)
                }
                alt=""
              />
              <span>
                <strong>Steel en verbeter “{remixWord.text}”</strong>
                <small>Gesteel van <b>{remixWord.createdByUsername}</b> · die oorspronklike is gesluit; voeg net iets agteraan.</small>
              </span>
            </>
          ) : 'Dink jou woord uit:'}
        </label>

        <div className={styles.invoerRy}>
          <input
            ref={wordInputRef}
            className={styles.veld}
            value={newWord}
            placeholder="Jou woord…"
            maxLength={40}
            onChange={(event) => {
              const nextWord = event.target.value
              if (
                remixWord &&
                !nextWord.startsWith(remixWord.text)
              ) {
                const input = event.currentTarget
                window.requestAnimationFrame(() => {
                  const end = input.value.length
                  input.setSelectionRange(end, end)
                })
                return
              }
              setNewWord(nextWord)
            }}
            onFocus={(event) => {
              if (!remixWord) return
              const end = event.currentTarget.value.length
              event.currentTarget.setSelectionRange(end, end)
            }}
            onClick={(event) => {
              if (!remixWord) return
              const minimum = remixWord.text.length
              if ((event.currentTarget.selectionStart ?? minimum) < minimum) {
                const end = event.currentTarget.value.length
                event.currentTarget.setSelectionRange(end, end)
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void submitWord()
              }
            }}
          />

          <button
            className={styles.plaas}
            disabled={
              submitting ||
              !newWord.trim() ||
              Boolean(
                remixWord &&
                newWord.trim().length <= remixWord.text.trim().length,
              )
            }
            onClick={() =>
              void submitWord()
            }
          >
            {submitting
              ? 'Sit in...'
              : 'Sit in!'}
          </button>
        </div>

        <span className={styles.as}>
          as {profile?.username}
        </span>

        {remixWord && (
          <button
            className={
              styles.kanselleer
            }
            onClick={() => {
              cancelRemix()
            }}
          >
            × Kanselleer remix
          </button>
        )}

        {(actionError ||
          liveError) && (
          <p className={styles.leeg}>
            {actionError || liveError}
          </p>
        )}
        </div>

        <h2 className={styles.alleKop} data-scroll-reveal="up">
          Alle Woorde
        </h2>

        {loading ? (
        <WoordLysSkeleton />
      ) : (
        <ul className={styles.woordLys}>
          {allWords.map((word, index) => (
            <li
              id={`word-${word.id}`}
              key={word.id}
              className={`${styles.woordItem} ${word.id === focusedWordId ? styles.focusedWord : ''} ${word.id === newlyCreatedWordId ? styles.newlyCreatedWord : ''}`}
            >
              <div className={styles.rang}>
                {index === 0
                  ? '👑'
                  : `#${index + 1}`}
              </div>

              <div className={styles.woordAvatarGroep}>
                <img
                  className={styles.woordAvatar}
                  src={
                    word.createdByUsername === '@lentedag'
                      ? lentedagSecondaryLogo
                      : resolveProfileAvatar(word.createdByAvatar) ??
                        fallbackProfileAvatar(word.createdByUid || word.createdByUsername)
                  }
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.mobieleWoordMeta}>
                  {word.createdByUsername}
                </span>
              </div>

              <div
                className={
                  styles.woordInfo
                }
              >
                <span
                  className={
                    styles.woordNaam
                  }
                >
                  {word.text}
                </span>

                <span
                  className={
                    styles.woordMeta
                  }
                >
                  {
                    word.createdByUsername
                  }
                </span>

                {word.isRemix &&
                  word.parentWordText && (
                    <span
                      className={
                        styles.verbeter
                      }
                    >
                      Gesteel en verbeter
                      van “
                      {word.parentWordText}
                      ”
                    </span>
                  )}
              </div>

              <div
                className={
                  styles.woordAksies
                }
              >
                <button
                  className={
                    styles.steelKnop
                  }
                  aria-label={`Steel en verbeter ${word.text}`}
                  title="Steel & Verbeter"
                  onClick={() =>
                    startRemix(word)
                  }
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h3.2c4.8 0 4.8 10 9.6 10H20M17 14l3 3-3 3M4 17h3.2c2.2 0 3.4-2.1 4.6-4.4M15.6 7c.4 0 .8 0 1.2 0H20M17 4l3 3-3 3" />
                  </svg>
                </button>

                <div
                  className={
                    styles.voteActions
                  }
                >
                  <button
                    aria-label={`Gee ${word.text} ’n stem`}
                    className={`${styles.voteButton} ${
                      word.currentUserVote ===
                      1
                        ? styles.activeUp
                        : ''
                    }`}
                    onClick={() =>
                      void vote(word, 1)
                    }
                  >
                    👍 {word.upVotes}
                  </button>

                  <button
                    aria-label={`Gee ${word.text} ’n afstem`}
                    className={`${styles.voteButton} ${
                      word.currentUserVote ===
                      -1
                        ? styles.activeDown
                        : ''
                    }`}
                    onClick={() =>
                      void vote(word, -1)
                    }
                  >
                    👎 {word.downVotes}
                  </button>
                </div>
              </div>
            </li>
          ))}

          {allWords.length === 0 && (
            <li className={styles.leeg}>
              Geen woorde nog nie. Plant
              die eerste een!
            </li>
          )}
        </ul>
        )}
      </div>
    </section>
  )
}
