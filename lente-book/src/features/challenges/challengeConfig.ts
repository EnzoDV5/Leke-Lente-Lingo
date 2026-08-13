export type ChallengeId =
  | 'doop'
  | 'remix'
  | 'guess'
  | 'photo'
  | 'friend'
  | 'wildcard'

export type ChallengeColour =
  | 'red'
  | 'blue'
  | 'pink'
  | 'purple'
  | 'yellow'
  | 'green'

export type ChallengeDefinition = {
  id: ChallengeId
  number: number
  name: string
  shortName: string
  description: string
  clue: string
  colour: ChallengeColour
  icon: string
  lockedUntilComplete: boolean
}

export const CORE_CHALLENGE_IDS: ChallengeId[] = [
  'doop',
  'remix',
  'guess',
  'photo',
  'friend',
]

export const ALL_CHALLENGE_IDS: ChallengeId[] = [
  ...CORE_CHALLENGE_IDS,
  'wildcard',
]

export const CHALLENGES: Record<
  ChallengeId,
  ChallengeDefinition
> = {
  doop: {
    id: 'doop',
    number: 1,
    name: 'Merk Dit',
    shortName: 'Merk Dit',
    description:
      'Dink ’n nuwe Afrikaanse woord vir die frase uit.',
    clue:
      'Soek die groot borde by die badkamer, rookarea, kroeg en verhoë.',
    colour: 'red',
    icon: '✏️',
    lockedUntilComplete: false,
  },

  remix: {
    id: 'remix',
    number: 2,
    name: 'Steel & Verbeter',
    shortName: 'Steel & Verbeter',
    description:
      'Kies iemand se woord en maak dit nóg beter.',
    clue:
      'Die tweede poster is langs Merk Dit op elke groot bord.',
    colour: 'green',
    icon: '✂️',
    lockedUntilComplete: false,
  },

  guess: {
    id: 'guess',
    number: 3,
    name: 'Raai die Lingo',
    shortName: 'Raai',
    description:
      'Kyk na ’n woord en raai by watter frase dit hoort.',
    clue:
      'Soek hierdie poster naby die ingang of vroeë wandelpad.',
    colour: 'yellow',
    icon: '👀',
    lockedUntilComplete: false,
  },

  photo: {
    id: 'photo',
    number: 4,
    name: 'Foto-doop',
    shortName: 'Foto-doop',
    description:
      'Neem ’n foto, gee die oomblik ’n woord en plaas dit op die Fotomuur.',
    clue:
      'Hierdie poster wag by een van die Lentedag-fotoareas.',
    colour: 'blue',
    icon: '📸',
    lockedUntilComplete: false,
  },

  friend: {
    id: 'friend',
    number: 5,
    name: 'Challenge ’n Chommie',
    shortName: 'Challenge ’n Chommie',
    description:
      'Stuur ’n frase na ’n vriend wat nie by die fees is nie.',
    clue:
      'Soek hierdie poster naby die ingang of wandelpaaie.',
    colour: 'pink',
    icon: '📲',
    lockedUntilComplete: false,
  },

  wildcard: {
    id: 'wildcard',
    number: 6,
    name: 'Die Wildcard',
    shortName: 'Wildcard',
    description:
      'Skep jou eie scenario en dink jou eie woord daarvoor uit.',
    clue:
      'Jy kan die Wildcard-poster sien, maar dit ontsluit eers wanneer die ander vyf versamel is.',
    colour: 'purple',
    icon: '⚡',
    lockedUntilComplete: true,
  },
}

export function isChallengeId(
  value: string | undefined,
): value is ChallengeId {
  return Boolean(
    value &&
      Object.prototype.hasOwnProperty.call(
        CHALLENGES,
        value,
      ),
  )
}