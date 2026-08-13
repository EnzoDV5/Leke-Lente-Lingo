import type { User } from 'firebase/auth'
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { stableProfileAvatarId } from './profileAvatars'
import type { FestivalArea } from '../types'

type Profile = { username: string; character: string }

export async function createWildcardCreation(input: { phraseText: string; wordText: string; user: User; profile: Profile }) {
  const phraseText = input.phraseText.trim()
  const wordText = input.wordText.trim()
  const storageArea: FestivalArea = 'stages'
  if (phraseText.length < 12 || phraseText.length > 180) throw new Error('Jou frase moet tussen 12 en 180 karakters wees.')
  if (wordText.length < 2 || wordText.length > 40) throw new Error('Jou woord moet tussen 2 en 40 karakters wees.')
  const phraseReference = doc(collection(db, 'customPhrases'))
  const wordReference = doc(collection(db, 'words'))
  const phraseId = `wildcard-${phraseReference.id}`
  const avatar = stableProfileAvatarId(input.profile.character)
  const batch = writeBatch(db)
  batch.set(doc(db, 'customPhrases', phraseId), { id: phraseId, text: phraseText, area: storageArea, colour: 'pers', isActive: true, createdByUid: input.user.uid, createdByUsername: input.profile.username, createdByAvatar: avatar, wordId: wordReference.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  batch.set(wordReference, { text: wordText, normalisedText: wordText.toLowerCase(), phraseId, phraseText, area: storageArea, createdByUid: input.user.uid, createdByUsername: input.profile.username, createdByAvatar: avatar, isRemix: false, parentWordId: null, parentWordText: null, rootWordId: null, upVotes: 0, downVotes: 0, score: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  batch.set(doc(db, 'users', input.user.uid, 'posters', 'wildcard'), {
    posterId: 'wildcard',
    collected: true,
    challengeCompleted: true,
    collectedAt: serverTimestamp(),
    challengeCompletedAt: serverTimestamp(),
    result: {
      kind: 'wildcard',
      word: wordText,
      phrase: phraseText,
      itemId: wordReference.id,
    },
  }, { merge: true })
  await batch.commit()
  return { phraseId, wordId: wordReference.id }
}
