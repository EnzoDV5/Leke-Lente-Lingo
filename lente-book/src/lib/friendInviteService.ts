import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, Timestamp, where, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import type { FestivalArea } from '../types'

export type FriendInvite = {
  id: string
  inviterUid: string
  inviterUsername: string
  phraseId: string
  phraseText: string
  area: FestivalArea
  status: 'pending' | 'completed'
  inviteeUid: string | null
  inviteeUsername: string | null
  wordId: string | null
  wordText: string | null
  expiresAt: Timestamp
  createdAt?: Timestamp
}

export async function createFriendInvite(input: Omit<FriendInvite, 'id' | 'status' | 'inviteeUid' | 'inviteeUsername' | 'wordId' | 'wordText' | 'expiresAt'>) {
  const reference = doc(collection(db, 'friendInvites'))
  const invite: FriendInvite = { ...input, id: reference.id, status: 'pending', inviteeUid: null, inviteeUsername: null, wordId: null, wordText: null, expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  await setDoc(reference, { ...invite, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return invite
}

export async function getFriendInvite(inviteId: string) {
  const snapshot = await getDoc(doc(db, 'friendInvites', inviteId))
  return snapshot.exists() ? snapshot.data() as FriendInvite : null
}

export async function getLatestFriendInvite(inviterUid: string) {
  const snapshot = await getDocs(query(collection(db, 'friendInvites'), where('inviterUid', '==', inviterUid)))
  const invites = snapshot.docs.map((item) => item.data() as FriendInvite)
  const pending = invites.filter((invite) => invite.status === 'pending' && invite.expiresAt.toMillis() > Date.now())
  const pool = pending.length ? pending : invites
  return pool.sort((first, second) => (second.createdAt?.toMillis() ?? 0) - (first.createdAt?.toMillis() ?? 0))[0] ?? null
}

export function watchFriendInvite(inviteId: string, callback: (invite: FriendInvite | null) => void) {
  return onSnapshot(doc(db, 'friendInvites', inviteId), (snapshot) => callback(snapshot.exists() ? snapshot.data() as FriendInvite : null))
}

export async function completeFriendInvite(invite: FriendInvite, inviteeUid: string, inviteeUsername: string, wordId: string, wordText: string) {
  const batch = writeBatch(db)
  batch.update(doc(db, 'friendInvites', invite.id), { status: 'completed', inviteeUid, inviteeUsername, wordId, wordText, completedAt: serverTimestamp(), updatedAt: serverTimestamp() })
  const sharedProgress = { collected: true, challengeCompleted: true, collectedAt: serverTimestamp(), challengeCompletedAt: serverTimestamp(), inviteId: invite.id }
  batch.set(doc(db, 'users', invite.inviterUid, 'posters', 'friend'), { ...sharedProgress, posterId: 'friend' }, { merge: true })
  batch.set(doc(db, 'users', inviteeUid, 'posters', 'doop'), { ...sharedProgress, posterId: 'doop' }, { merge: true })
  await batch.commit()
}
