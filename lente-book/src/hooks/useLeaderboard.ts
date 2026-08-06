import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  collection,
  onSnapshot,
} from 'firebase/firestore'

import { db } from '../lib/firebase'
import type {
  VoteValue,
} from '../types'

type StoredWord = {
  id: string
  text: string

  createdByUid: string
  createdByUsername: string
  createdByAvatar: string
}

type StoredVote = {
  id: string
  wordId: string
  userId: string
  value: VoteValue
}

export type LeaderboardWord =
  StoredWord & {
    upVotes: number
    downVotes: number
    score: number
    totalVotes: number
  }

export function useLeaderboard() {
  const [storedWords, setStoredWords] =
    useState<StoredWord[]>([])

  const [storedVotes, setStoredVotes] =
    useState<StoredVote[]>([])

  const [wordsLoading, setWordsLoading] =
    useState(true)

  const [votesLoading, setVotesLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'words'),

      (snapshot) => {
        const words =
          snapshot.docs.map(
            (snapshotDocument) => ({
              id: snapshotDocument.id,
              ...snapshotDocument.data(),
            }),
          ) as StoredWord[]

        setStoredWords(words)
        setWordsLoading(false)
        setError('')
      },

      (snapshotError) => {
        console.error(
          'Leaderboard words error:',
          snapshotError,
        )

        setError(
          'Die woorde kon nie gelaai word nie.',
        )

        setWordsLoading(false)
      },
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'votes'),

      (snapshot) => {
        const votes =
          snapshot.docs.map(
            (snapshotDocument) => ({
              id: snapshotDocument.id,
              ...snapshotDocument.data(),
            }),
          ) as StoredVote[]

        setStoredVotes(votes)
        setVotesLoading(false)
        setError('')
      },

      (snapshotError) => {
        console.error(
          'Leaderboard votes error:',
          snapshotError,
        )

        setError(
          'Die votes kon nie gelaai word nie.',
        )

        setVotesLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const rankedWords = useMemo(() => {
    return storedWords.map((word) => {
      const wordVotes =
        storedVotes.filter(
          (vote) =>
            vote.wordId === word.id,
        )

      const upVotes =
        wordVotes.filter(
          (vote) => vote.value === 1,
        ).length

      const downVotes =
        wordVotes.filter(
          (vote) => vote.value === -1,
        ).length

      return {
        ...word,

        upVotes,
        downVotes,

        score:
          upVotes - downVotes,

        totalVotes:
          wordVotes.length,
      }
    })
  }, [
    storedWords,
    storedVotes,
  ])

  const topWords = useMemo(() => {
    return [...rankedWords]
      .sort((first, second) => {
        if (
          second.score !== first.score
        ) {
          return (
            second.score - first.score
          )
        }

        return (
          second.upVotes -
          first.upVotes
        )
      })
      .slice(0, 3)
  }, [rankedWords])

  const worstWords = useMemo(() => {
    return [...rankedWords]
      .filter(
        (word) =>
          word.totalVotes > 0,
      )
      .sort((first, second) => {
        if (
          first.score !== second.score
        ) {
          return (
            first.score - second.score
          )
        }

        return (
          second.downVotes -
          first.downVotes
        )
      })
      .slice(0, 3)
  }, [rankedWords])

  return {
    topWords,
    worstWords,

    totalVotes:
      storedVotes.length,

    loading:
      wordsLoading || votesLoading,

    error,
  }
}