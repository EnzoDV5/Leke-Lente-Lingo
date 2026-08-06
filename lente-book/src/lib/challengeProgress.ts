import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from './firebase'

import type {
  ChallengeId,
} from '../features/challenges/challengeConfig'

type ProgressOptions = {
  collected?: boolean
  challengeCompleted?: boolean
}

async function saveChallengeProgress(
  userId: string,
  challengeId: ChallengeId,
  options: ProgressOptions,
) {
  const progressReference = doc(
    db,
    'users',
    userId,
    'posters',
    challengeId,
  )

  const update: Record<string, unknown> = {
    posterId: challengeId,
  }

  if (options.collected) {
    update.collected = true
    update.collectedAt = serverTimestamp()
  }

  if (options.challengeCompleted) {
    update.challengeCompleted = true
    update.challengeCompletedAt =
      serverTimestamp()
  }

  await setDoc(
    progressReference,
    update,
    {
      merge: true,
    },
  )
}

export async function collectChallenge(
  userId: string,
  challengeId: ChallengeId,
) {
  await saveChallengeProgress(
    userId,
    challengeId,
    {
      collected: true,
    },
  )
}

export async function completeChallenge(
  userId: string,
  challengeId: ChallengeId,
  collectedFromScan: boolean,
) {
  await saveChallengeProgress(
    userId,
    challengeId,
    {
      challengeCompleted: true,
      collected: collectedFromScan,
    },
  )
}