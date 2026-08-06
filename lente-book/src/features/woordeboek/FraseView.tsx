import {
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import { frases } from '../../lib/mockData'
import {
  bgKleur,
  tekstKleur,
} from '../../lib/kleur'

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

import type {
  FestivalArea,
  VoteValue,
} from '../../types'

import styles from './FraseView.module.css'

const temporaryAreas: Record<
  string,
  FestivalArea
> = {
  chip: 'bar',
  luister: 'bar',
  roomys: 'bar',
  nana: 'stages',
  kyk: 'stages',
  foto: 'stages',
}

export default function FraseView() {
  const { id = '' } = useParams()

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

  if (!phrase) {
    return (
      <div className={styles.wrap}>
        <Link
          to="/woordeboek"
          className={styles.terug}
        >
          ← Terug na Woordeboek
        </Link>

        <p className={styles.leeg}>
          Hierdie frase bestaan nie.
        </p>
      </div>
    )
  }

  const area =
    temporaryAreas[phrase.id] ??
    'stages'

  const submitWord = async () => {
    if (!user || !profile) {
      setActionError(
        'Jy moet eers aanmeld.',
      )

      return
    }

    if (!newWord.trim()) return

    setSubmitting(true)
    setActionError('')

    try {
      await addWord({
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

      setNewWord('')
      setRemixWord(null)
    } catch (error) {
      console.error(
        'Add word error:',
        error,
      )

      setActionError(
        error instanceof Error
          ? error.message
          : 'Ons kon nie jou woord plaas nie.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const vote = async (
    word: LiveWord,
    value: VoteValue,
  ) => {
    if (!user || !profile) return

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
    } catch (error) {
      console.error(
        'Vote error:',
        error,
      )

      setActionError(
        'Ons kon nie jou vote stoor nie.',
      )
    }
  }

  const startRemix = (
    word: LiveWord,
  ) => {
    setRemixWord(word)
    setNewWord(word.text)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className={styles.wrap}>
      <Link
        to="/woordeboek"
        className={styles.terug}
      >
        ← Terug na Woordeboek
      </Link>

      <div
        className={styles.banier}
        style={{
          background:
            bgKleur(phrase.kleur),
          color:
            tekstKleur(phrase.kleur),
        }}
      >
        <p className={styles.frase}>
          {phrase.beskrywing}
        </p>

        <span className={styles.telling}>
          ⚡ {words.length} woorde uitgedink
        </span>
      </div>

      <div className={styles.invoer}>
        <label className={styles.etiket}>
          {remixWord
            ? `Steel en verbeter “${remixWord.text}”:`
            : 'Dink jou woord uit:'}
        </label>

        <div className={styles.invoerRy}>
          <input
            className={styles.veld}
            value={newWord}
            placeholder="Jou woord…"
            maxLength={40}
            onChange={(event) =>
              setNewWord(
                event.target.value,
              )
            }
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
              !newWord.trim()
            }
            onClick={() =>
              void submitWord()
            }
          >
            {submitting
              ? 'Plaas...'
              : 'Plaas!'}
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
              setRemixWord(null)
              setNewWord('')
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

      <h2 className={styles.alleKop}>
        Alle Woorde
      </h2>

      {loading ? (
        <p className={styles.leeg}>
          Woorde groei...
        </p>
      ) : (
        <ul className={styles.woordLys}>
          {words.map((word, index) => (
            <li
              key={word.id}
              className={styles.woordItem}
            >
              <div className={styles.rang}>
                {index === 0
                  ? '👑'
                  : `#${index + 1}`}
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

              <button
                className={
                  styles.steelKnop
                }
                onClick={() =>
                  startRemix(word)
                }
              >
                Steel &amp; Verbeter
              </button>

              <div
                className={
                  styles.voteActions
                }
              >
                <button
                  aria-label="Upvote"
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
                  aria-label="Downvote"
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
            </li>
          ))}

          {words.length === 0 && (
            <li className={styles.leeg}>
              Geen woorde nog nie. Plant
              die eerste een!
            </li>
          )}
        </ul>
      )}
    </div>
  )
}