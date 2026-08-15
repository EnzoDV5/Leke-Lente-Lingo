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
  updatedAt?: Timestamp | null
}

export function useLivePhotos() {
  const [photos, setPhotos] =
    useState<LivePhoto[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false
    // A fresh anonymous sign-in (e.g. right after finishing onboarding) can
    // briefly race Firestore's own internal auth-token attachment: React
    // already sees the signed-in user, but the very first onSnapshot call
    // can still land a split second too early and get a one-off
    // permission-denied that never self-heals on its own. One short retry
    // covers that window without masking a genuine, persistent failure.
    let retriedAfterAuthRace = false

    const subscribe = () => {
      unsubscribe = onSnapshot(
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
              first.updatedAt?.toMillis() ??
              first.createdAt?.toMillis() ??
              0

            const secondTime =
              second.updatedAt?.toMillis() ??
              second.createdAt?.toMillis() ??
              0

            return secondTime - firstTime
          })

          const seenUsers = new Set<string>()
          const onePhotoPerUser = nextPhotos.filter(
            (photo) => {
              if (seenUsers.has(photo.createdByUid)) {
                return false
              }

              seenUsers.add(photo.createdByUid)
              return true
            },
          )

          setPhotos(onePhotoPerUser.slice(0, 40))
          setLoading(false)
          setError('')
        },

        (snapshotError) => {
          console.error(
            'Live photos error:',
            snapshotError,
          )

          if (
            !retriedAfterAuthRace &&
            snapshotError.code === 'permission-denied'
          ) {
            retriedAfterAuthRace = true
            window.setTimeout(() => {
              if (!cancelled) subscribe()
            }, 1200)
            return
          }

          setError(
            'Die oomblikmuur kon nie gelaai word nie.',
          )

          setLoading(false)
        },
      )
    }

    subscribe()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return {
    photos,
    loading,
    error,
  }
}
