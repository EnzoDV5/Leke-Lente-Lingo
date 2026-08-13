import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  collection,
  onSnapshot,
  query,
  where,
  type Timestamp,
} from 'firebase/firestore'

import { db } from '../lib/firebase'
import { officialPhraseText } from '../lib/officialPhraseCopy'
import type {
  FestivalArea,
  VoteValue,
} from '../types'

export type LiveWord = {
  id: string

  text: string
  normalisedText: string

  phraseId: string
  phraseText: string
  area: FestivalArea

  createdByUid: string
  createdByUsername: string
  createdByAvatar: string

  isRemix: boolean

  parentWordId: string | null
  parentWordText: string | null
  rootWordId: string | null

  createdAt: Timestamp | null

  upVotes: number
  downVotes: number
  score: number

  currentUserVote: VoteValue | null
}

type StoredWord = Omit<
  LiveWord,
  | 'upVotes'
  | 'downVotes'
  | 'score'
  | 'currentUserVote'
>

type StoredVote = {
  id: string
  wordId: string
  phraseId: string
  userId: string
  username: string
  value: VoteValue
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

function timestampValue(
  timestamp: Timestamp | null,
) {
  return timestamp?.toMillis() ?? 0
}

export function useLiveWords(
  phraseId: string,
  currentUserId?: string,
) {
  const [storedWords, setStoredWords] =
    useState<StoredWord[]>([])

  const [votes, setVotes] =
    useState<StoredVote[]>([])

  const [wordsLoading, setWordsLoading] =
    useState(true)

  const [votesLoading, setVotesLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (!phraseId) {
      setStoredWords([])
      setWordsLoading(false)
      return
    }

    const wordsQuery = query(
      collection(db, 'words'),
      where('phraseId', '==', phraseId),
    )

    const unsubscribe = onSnapshot(
      wordsQuery,
      (snapshot) => {
        const nextWords =
          snapshot.docs.map((documentSnapshot) => {
            const data = documentSnapshot.data()
            const storedPhraseId = String(data.phraseId ?? phraseId)
            return {
              id: documentSnapshot.id,
              ...data,
              phraseText: officialPhraseText(storedPhraseId, String(data.phraseText ?? '')),
            }
          }) as StoredWord[]

        setStoredWords(nextWords)
        setWordsLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error(
          'Live words error:',
          snapshotError,
        )

        setError(
          'Ons kon nie die woorde laai nie.',
        )

        setWordsLoading(false)
      },
    )

    return unsubscribe
  }, [phraseId])

  useEffect(() => {
    if (!phraseId) {
      setVotes([])
      setVotesLoading(false)
      return
    }

    const votesQuery = query(
      collection(db, 'votes'),
      where('phraseId', '==', phraseId),
    )

    const unsubscribe = onSnapshot(
      votesQuery,
      (snapshot) => {
        const nextVotes =
          snapshot.docs.map(
            (documentSnapshot) => ({
              id: documentSnapshot.id,
              ...documentSnapshot.data(),
            }),
          ) as StoredVote[]

        setVotes(nextVotes)
        setVotesLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error(
          'Live votes error:',
          snapshotError,
        )

        setError(
          'Ons kon nie die stemme laai nie.',
        )

        setVotesLoading(false)
      },
    )

    return unsubscribe
  }, [phraseId])

  const words = useMemo(() => {
    return storedWords
      .map((word) => {
        const wordVotes = votes.filter(
          (vote) =>
            vote.wordId === word.id,
        )

        const upVotes = wordVotes.filter(
          (vote) => vote.value === 1,
        ).length

        const downVotes = wordVotes.filter(
          (vote) => vote.value === -1,
        ).length

        const currentUserVote =
          wordVotes.find(
            (vote) =>
              vote.userId ===
              currentUserId,
          )?.value ?? null

        return {
          ...word,
          upVotes,
          downVotes,
          score: upVotes - downVotes,
          currentUserVote,
        }
      })
      .sort((first, second) => {
        if (second.score !== first.score) {
          return second.score - first.score
        }

        return (
          timestampValue(second.createdAt) -
          timestampValue(first.createdAt)
        )
      })
  }, [
    storedWords,
    votes,
    currentUserId,
  ])

  return {
    words,
    loading:
      wordsLoading || votesLoading,
    error,
  }
}

export function useLiveWordCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'words'),
      (snapshot) => {
        setCount(snapshot.size)
        setLoading(false)
      },
      (error) => {
        console.error(
          'Word counter error:',
          error,
        )

        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return {
    count,
    loading,
  }
}
