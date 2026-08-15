import {
  useEffect,
  useState,
} from 'react'

import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../lib/firebase'
import { frases } from '../lib/mockData'
import { OFFICIAL_PHRASE_COPY, officialPhraseText } from '../lib/officialPhraseCopy'

import type {
  FestivalArea,
} from '../types'

export type LivePhrase = {
  id: string
  text: string
  area: FestivalArea
  boardNumber: number
  colour: string
  isWildcard?: boolean
}

const OFFICIAL_FALLBACK_PHRASES: LivePhrase[] = frases
  .filter((phrase) => Object.prototype.hasOwnProperty.call(OFFICIAL_PHRASE_COPY, phrase.id))
  .map((phrase, index) => ({
    id: phrase.id,
    text: officialPhraseText(phrase.id, phrase.beskrywing),
    area: phrase.area,
    boardNumber: index + 1,
    colour: phrase.kleur,
  }))

export function useLivePhrases() {
  const [phrases, setPhrases] =
    useState<LivePhrase[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const phrasesQuery = query(
      collection(db, 'phrases'),
      where('isActive', '==', true),
    )
    const customPhrasesQuery = query(
      collection(db, 'customPhrases'),
      where('isActive', '==', true),
    )

    let standardPhrases: LivePhrase[] = OFFICIAL_FALLBACK_PHRASES
    let wildcardPhrases: LivePhrase[] = []
    let standardReady = false
    let wildcardReady = false
    let standardFailed = false
    let wildcardFailed = false
    let cancelled = false

    const publish = () => {
      const nextPhrases = [...standardPhrases, ...wildcardPhrases]
      nextPhrases.sort((first, second) => first.area.localeCompare(second.area) || first.boardNumber - second.boardNumber)
      setPhrases(nextPhrases)
      setLoading(!(standardReady && wildcardReady))
      setError(standardFailed || wildcardFailed ? 'Van die regstreekse frases kon nie gelaai word nie. Die ingeboude frases word intussen gewys.' : '')
    }

    // A fresh anonymous sign-in can briefly race Firestore's own internal
    // auth-token attachment, producing a one-off permission-denied on the
    // very first onSnapshot call that never self-heals on its own. One
    // short retry per listener covers that window.
    let retriedStandard = false
    let unsubscribe = () => {}
    const subscribeStandard = () => {
      unsubscribe = onSnapshot(
        phrasesQuery,
        (snapshot) => {
          const liveById = new Map(
            snapshot.docs.map((documentSnapshot) => [
              documentSnapshot.id,
              documentSnapshot.data(),
            ]),
          )

          standardPhrases = OFFICIAL_FALLBACK_PHRASES.map((fallbackPhrase) => {
            const livePhrase = liveById.get(fallbackPhrase.id)
            return {
              ...fallbackPhrase,
              ...(livePhrase ?? {}),
              id: fallbackPhrase.id,
              text: officialPhraseText(
                fallbackPhrase.id,
                String(livePhrase?.text ?? fallbackPhrase.text),
              ),
            } as LivePhrase
          })

          standardFailed = false
          standardReady = true
          publish()
        },
        (snapshotError) => {
          console.error(
            'Live phrases error:',
            snapshotError,
          )

          if (!retriedStandard && snapshotError.code === 'permission-denied') {
            retriedStandard = true
            window.setTimeout(() => {
              if (!cancelled) subscribeStandard()
            }, 1200)
            return
          }

          standardFailed = true
          standardReady = true
          publish()
        },
      )
    }

    let retriedCustom = false
    let unsubscribeCustom = () => {}
    const subscribeCustom = () => {
      unsubscribeCustom = onSnapshot(
        customPhrasesQuery,
        (snapshot) => {
          wildcardPhrases = snapshot.docs.map((documentSnapshot, index) => ({
            id: documentSnapshot.id,
            text: String(documentSnapshot.data().text ?? ''),
            area: documentSnapshot.data().area as FestivalArea,
            boardNumber: 1000 + index,
            colour: String(documentSnapshot.data().colour ?? 'pers'),
            isWildcard: true,
          }))
          wildcardFailed = false
          wildcardReady = true
          publish()
        },
        (snapshotError) => {
          if (!retriedCustom && (snapshotError as { code?: string }).code === 'permission-denied') {
            retriedCustom = true
            window.setTimeout(() => {
              if (!cancelled) subscribeCustom()
            }, 1200)
            return
          }

          wildcardFailed = true
          wildcardReady = true
          publish()
        },
      )
    }

    subscribeStandard()
    subscribeCustom()

    return () => {
      cancelled = true
      unsubscribe()
      unsubscribeCustom()
    }
  }, [])

  return {
    phrases,
    loading,
    error,
  }
}
