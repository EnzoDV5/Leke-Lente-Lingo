import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  collection,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore'

import { db } from '../lib/firebase'

import {
  ALL_CHALLENGE_IDS,
  CORE_CHALLENGE_IDS,
  type ChallengeId,
} from '../features/challenges/challengeConfig'

export type ChallengeProgress = {
  posterId: ChallengeId
  collected: boolean
  challengeCompleted: boolean
  collectedAt: Timestamp | null
  challengeCompletedAt: Timestamp | null
}

function emptyProgress(
  challengeId: ChallengeId,
): ChallengeProgress {
  return {
    posterId: challengeId,
    collected: false,
    challengeCompleted: false,
    collectedAt: null,
    challengeCompletedAt: null,
  }
}

export function useChallengeProgress(
  userId?: string,
) {
  const [savedProgress, setSavedProgress] =
    useState<Partial<
      Record<
        ChallengeId,
        ChallengeProgress
      >
    >>({})

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (!userId) {
      setSavedProgress({})
      setLoading(false)
      return
    }

    const progressCollection = collection(
      db,
      'users',
      userId,
      'posters',
    )

    const unsubscribe = onSnapshot(
      progressCollection,
      (snapshot) => {
        const nextProgress: Partial<
          Record<
            ChallengeId,
            ChallengeProgress
          >
        > = {}

        snapshot.docs.forEach(
          (documentSnapshot) => {
            const data =
              documentSnapshot.data()

            const challengeId =
              documentSnapshot.id as ChallengeId

            if (
              ALL_CHALLENGE_IDS.includes(
                challengeId,
              )
            ) {
              nextProgress[challengeId] = {
                posterId: challengeId,
                collected:
                  data.collected ?? false,
                challengeCompleted:
                  data.challengeCompleted ??
                  false,
                collectedAt:
                  data.collectedAt ?? null,
                challengeCompletedAt:
                  data.challengeCompletedAt ??
                  null,
              }
            }
          },
        )

        setSavedProgress(nextProgress)
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error(
          'Challenge progress error:',
          snapshotError,
        )

        setError(
          'Ons kon nie jou versameling laai nie.',
        )

        setLoading(false)
      },
    )

    return unsubscribe
  }, [userId])

  const progress = useMemo(() => {
    return ALL_CHALLENGE_IDS.reduce(
      (result, challengeId) => {
        result[challengeId] =
          savedProgress[challengeId] ??
          emptyProgress(challengeId)

        return result
      },
      {} as Record<
        ChallengeId,
        ChallengeProgress
      >,
    )
  }, [savedProgress])

  const collectedCount =
    ALL_CHALLENGE_IDS.filter(
      (challengeId) =>
        progress[challengeId].collected,
    ).length

  const coreCollectedCount =
    CORE_CHALLENGE_IDS.filter(
      (challengeId) =>
        progress[challengeId].collected,
    ).length

  const wildcardUnlocked =
    coreCollectedCount ===
    CORE_CHALLENGE_IDS.length

  const allCollected =
    collectedCount ===
    ALL_CHALLENGE_IDS.length

  return {
    progress,
    collectedCount,
    coreCollectedCount,
    wildcardUnlocked,
    allCollected,
    loading,
    error,
  }
}