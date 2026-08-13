import {
  collection,
  doc,
  type DocumentData,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db } from './firebase'
import { officialPhraseText } from './officialPhraseCopy'

import type {
  ChallengeId,
} from '../features/challenges/challengeConfig'

export type ChallengeResult = {
  kind: 'word' | 'remix' | 'guess' | 'photo' | 'friend' | 'vote' | 'wildcard'
  word?: string
  phrase?: string
  originalWord?: string
  photoUrl?: string
  itemId?: string
  partnerUsername?: string
  area?: string
  voteValue?: 1 | -1
}

type ProgressOptions = {
  collected?: boolean
  challengeCompleted?: boolean
  result?: ChallengeResult
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

  if (options.result) {
    update.result = options.result
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
  result?: ChallengeResult,
) {
  await saveChallengeProgress(
    userId,
    challengeId,
    {
      challengeCompleted: true,
      collected: collectedFromScan,
      result,
    },
  )
}

export async function findExistingChallengeResult(
  userId: string,
  challengeId: ChallengeId,
): Promise<ChallengeResult | null> {
  if (challengeId === 'doop' || challengeId === 'remix') {
    const snapshot = await getDocs(query(
      collection(db, 'words'),
      where('createdByUid', '==', userId),
    ))
    const friendWordIds = new Set<string>()

    if (challengeId === 'doop') {
      const friendInvites = await getDocs(query(
        collection(db, 'friendInvites'),
        where('inviteeUid', '==', userId),
      ))

      friendInvites.docs.forEach((item) => {
        const invite = item.data()
        if (invite.status === 'completed' && invite.wordId) {
          friendWordIds.add(String(invite.wordId))
        }
      })
    }

    const candidates = snapshot.docs
      .map((item): DocumentData & { id: string } => ({ id: item.id, ...item.data() }))
      .filter((item) => Boolean(item.isRemix) === (challengeId === 'remix'))
      .filter((item) => (
        challengeId !== 'doop' ||
        (
          item.sourceChallenge !== 'friend' &&
          !friendWordIds.has(item.id)
        )
      ))
      .sort((first, second) => (second.createdAt?.toMillis?.() ?? 0) - (first.createdAt?.toMillis?.() ?? 0))
    const latest = candidates[0]
    if (!latest) return null
    return {
      kind: challengeId === 'remix' ? 'remix' : 'word',
      word: String(latest.text ?? ''),
      phrase: officialPhraseText(String(latest.phraseId ?? ''), String(latest.phraseText ?? '')),
      ...(challengeId === 'remix'
        ? { originalWord: String(latest.parentWordText ?? '') }
        : {}),
      area: String(latest.area ?? ''),
      itemId: latest.id,
    }
  }

  if (challengeId === 'photo') {
    const snapshot = await getDocs(query(
      collection(db, 'photos'),
      where('createdByUid', '==', userId),
    ))
    const candidates = snapshot.docs
      .map((item): DocumentData & { id: string } => ({ id: item.id, ...item.data() }))
      .sort((first, second) => (
        second.updatedAt?.toMillis?.() ??
        second.createdAt?.toMillis?.() ??
        0
      ) - (
        first.updatedAt?.toMillis?.() ??
        first.createdAt?.toMillis?.() ??
        0
      ))
    const latest = candidates[0]
    return latest
      ? {
          kind: 'photo',
          word: String(latest.word ?? ''),
          photoUrl: String(latest.downloadUrl ?? ''),
          itemId: latest.id,
        }
      : null
  }

  if (challengeId === 'friend') {
    const snapshot = await getDocs(query(
      collection(db, 'friendInvites'),
      where('inviterUid', '==', userId),
    ))
    const candidates = snapshot.docs
      .map((item): DocumentData & { id: string } => ({ id: item.id, ...item.data() }))
      .filter((item) => item.status === 'completed')
      .sort((first, second) => (second.completedAt?.toMillis?.() ?? 0) - (first.completedAt?.toMillis?.() ?? 0))
    const latest = candidates[0]
    return latest
      ? {
          kind: 'friend',
          word: String(latest.wordText ?? ''),
          phrase: officialPhraseText(String(latest.phraseId ?? ''), String(latest.phraseText ?? '')),
          partnerUsername: String(latest.inviteeUsername ?? ''),
          area: String(latest.area ?? ''),
          itemId: String(latest.wordId ?? latest.id),
        }
      : null
  }

  if (challengeId === 'vote') {
    const snapshot = await getDocs(query(
      collection(db, 'votes'),
      where('userId', '==', userId),
    ))
    const candidates = snapshot.docs
      .map((item): DocumentData & { id: string } => ({ id: item.id, ...item.data() }))
      .sort((first, second) => (second.updatedAt?.toMillis?.() ?? second.createdAt?.toMillis?.() ?? 0) - (first.updatedAt?.toMillis?.() ?? first.createdAt?.toMillis?.() ?? 0))
    const latest = candidates[0]
    if (!latest) return null
    const wordSnapshot = await getDoc(doc(db, 'words', String(latest.wordId ?? '')))
    const word = wordSnapshot.data()
    return {
      kind: 'vote',
      word: String(word?.text ?? 'Jou gekose woord'),
      phrase: officialPhraseText(String(word?.phraseId ?? ''), String(word?.phraseText ?? '')),
      itemId: String(latest.wordId ?? ''),
      voteValue: latest.value === -1 ? -1 : 1,
    }
  }

  return null
}
