import type {
  Timestamp,
} from 'firebase/firestore'

/*
 * Existing local website types
 */

export type Foto = {
  id: string
  woord: string
  handle: string
  kleur: string
}

export type HoeStap = {
  nommer: number
  titel: string
  beskrywing: string
  kleur: string
}

export type Woord = {
  id: string
  woord: string
  handle: string
  stemme: number

  verbeterVan?: string
  verbeterDeur?: string
}

export type Frase = {
  id: string
  beskrywing: string
  kleur: string
  woorde: Woord[]
}

export type Jagkaart = {
  id: string
  naam: string
  tipe: string
  tipeKleur: string
  leidraad: string
  versamel: boolean
}

/*
 * Firebase database types
 */

export type FestivalArea =
  | 'bathroom'
  | 'smoking'
  | 'bar'
  | 'stages'

export type VoteValue = 1 | -1

export type ChallengeType =
  | 'doop'
  | 'vote'
  | 'remix'
  | 'guess'
  | 'wildcard'
  | 'photo'

export type UserProfileRecord = {
  uid: string

  email: string
  googleName: string
  googlePhoto: string

  username: string
  character: string
  useGooglePhoto: boolean
  onboardingComplete: boolean

  wordsCreatedCount: number
  wordsRemixedCount: number
  votesCount: number
  photosAddedCount: number
  postersCollectedCount: number

  huntCompleted: boolean

  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type PhraseRecord = {
  id: string

  text: string
  area: FestivalArea
  boardNumber: number

  colour: string
  isActive: boolean

  wordCount: number

  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type WordRecord = {
  id: string

  text: string
  normalisedText: string

  phraseId: string
  phraseText: string
  area: FestivalArea

  createdByUid: string
  createdByUsername: string
  createdByAvatar: string

  isRemix: boolean

  parentWordId: string | null
  parentWordText: string | null
  rootWordId: string | null

  upVotes: number
  downVotes: number
  score: number

  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type VoteRecord = {
  id: string

  wordId: string
  phraseId: string

  userId: string
  username: string

  value: VoteValue

  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type PhotoRecord = {
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

export type PosterRecord = {
  id: string

  posterNumber: number
  name: string
  area: FestivalArea

  challengeType: ChallengeType
  challengeRoute: string

  clue: string
  qrCode: string

  isActive: boolean
}

export type PosterProgressRecord = {
  posterId: string
  posterNumber: number

  collected: boolean
  challengeCompleted: boolean

  collectedAt: Timestamp | null
  challengeCompletedAt: Timestamp | null
}

export type GlobalStatsRecord = {
  totalUsers: number
  totalPhrases: number
  totalWords: number
  totalRemixes: number
  totalVotes: number
  totalPhotos: number
  completedHunters: number

  updatedAt: Timestamp | null
}