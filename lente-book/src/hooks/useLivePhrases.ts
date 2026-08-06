import {
  useEffect,
  useState,
} from 'react'

import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../lib/firebase'

import type {
  FestivalArea,
} from '../types'

export type LivePhrase = {
  id: string
  text: string
  area: FestivalArea
  boardNumber: number
  colour: string
}

export function useLivePhrases() {
  const [phrases, setPhrases] =
    useState<LivePhrase[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const phrasesQuery = query(
      collection(db, 'phrases'),
      where('isActive', '==', true),
    )

    const unsubscribe = onSnapshot(
      phrasesQuery,
      (snapshot) => {
        const nextPhrases =
          snapshot.docs.map(
            (documentSnapshot) => ({
              id: documentSnapshot.id,
              ...documentSnapshot.data(),
            }),
          ) as LivePhrase[]

        nextPhrases.sort(
          (first, second) =>
            first.area.localeCompare(
              second.area,
            ) ||
            first.boardNumber -
              second.boardNumber,
        )

        setPhrases(nextPhrases)
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error(
          'Live phrases error:',
          snapshotError,
        )

        setError(
          'Ons kon nie die frases laai nie.',
        )

        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return {
    phrases,
    loading,
    error,
  }
}