import {
  useEffect,
  useState,
} from 'react'

import {
  collection,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore'

import { db } from '../lib/firebase'

export type LivePhoto = {
  id: string
  word: string

  storagePath: string
  downloadUrl: string

  createdByUid: string
  createdByUsername: string
  createdByAvatar: string

  frameColour: string
  approved: boolean

  createdAt: Timestamp | null
}

export function useLivePhotos() {
  const [photos, setPhotos] =
    useState<LivePhoto[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'photos'),

      (snapshot) => {
        const nextPhotos =
          snapshot.docs.map((snapshotDocument) => {
            return {
              id: snapshotDocument.id,
              ...snapshotDocument.data(),
            } as LivePhoto
          })

        nextPhotos.sort((first, second) => {
          const firstTime =
            first.createdAt?.toMillis() ?? 0

          const secondTime =
            second.createdAt?.toMillis() ?? 0

          return secondTime - firstTime
        })

        setPhotos(nextPhotos.slice(0, 40))
        setLoading(false)
        setError('')
      },

      (snapshotError) => {
        console.error(
          'Live photos error:',
          snapshotError,
        )

        setError(
          'Die fotomuur kon nie gelaai word nie.',
        )

        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return {
    photos,
    loading,
    error,
  }
}