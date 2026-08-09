import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import type {
  User,
} from 'firebase/auth'

import { db } from './firebase'
import { stableProfileAvatarId } from './profileAvatars'
import type {
  FestivalArea,
  VoteValue,
} from '../types'

type CreatorProfile = {
  username: string
  character: string
  useGooglePhoto: boolean
  googlePhoto?: string | null
}

type ParentWord = {
  id: string
  text: string
  rootWordId: string | null
}

type AddWordInput = {
  text: string

  phraseId: string
  phraseText: string
  area: FestivalArea

  user: User
  profile: CreatorProfile

  parentWord?: ParentWord | null
}

export async function addWord({
  text,
  phraseId,
  phraseText,
  area,
  user,
  profile,
  parentWord = null,
}: AddWordInput) {
  const cleanText = text.trim()

  if (cleanText.length < 2) {
    throw new Error(
      'Jou woord moet minstens 2 karakters hê.',
    )
  }

  if (cleanText.length > 40) {
    throw new Error(
      'Jou woord mag nie langer as 40 karakters wees nie.',
    )
  }

  const avatar =
    profile.useGooglePhoto
      ? user.photoURL ?? profile.googlePhoto ?? ''
      : stableProfileAvatarId(profile.character)

  const wordReference = await addDoc(
    collection(db, 'words'),
    {
      text: cleanText,

      normalisedText: cleanText
        .toLowerCase()
        .trim(),

      phraseId,
      phraseText,
      area,

      createdByUid: user.uid,
      createdByUsername: profile.username,
      createdByAvatar: avatar,

      isRemix: Boolean(parentWord),

      parentWordId:
        parentWord?.id ?? null,

      parentWordText:
        parentWord?.text ?? null,

      rootWordId: parentWord
        ? parentWord.rootWordId ??
          parentWord.id
        : null,

      /*
       * These remain zero in Firestore.
       * Live totals are calculated securely
       * from the votes collection.
       */
      upVotes: 0,
      downVotes: 0,
      score: 0,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  )

  return wordReference.id
}

type SetVoteInput = {
  wordId: string
  phraseId: string

  user: User
  username: string

  value: VoteValue

  currentVote: VoteValue | null
}

export async function setWordVote({
  wordId,
  phraseId,
  user,
  username,
  value,
  currentVote,
}: SetVoteInput) {
  const voteId = `${user.uid}_${wordId}`

  const voteReference = doc(
    db,
    'votes',
    voteId,
  )

  /*
   * Clicking the same vote again removes it.
   */
  if (currentVote === value) {
    await deleteDoc(voteReference)
    return
  }

  /*
   * Switching an existing vote only changes
   * the value and update time.
   */
  if (currentVote !== null) {
    await updateDoc(voteReference, {
      value,
      updatedAt: serverTimestamp(),
    })

    return
  }

  /*
   * First vote for this word.
   */
  await setDoc(voteReference, {
    id: voteId,

    wordId,
    phraseId,

    userId: user.uid,
    username,

    value,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
