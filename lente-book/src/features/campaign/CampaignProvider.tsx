import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { doc, onSnapshot } from 'firebase/firestore'

import PageLoader from '../../components/ui/PageLoader'
import { db } from '../../lib/firebase'
import {
  DEFAULT_PRE_CAMPAIGN_PHRASE_IDS,
  DEFAULT_CAMPAIGN_PHASE,
  isCampaignPhase,
  type CampaignPhase,
} from './campaignConfig'

type CampaignContextValue = {
  phase: CampaignPhase
  featuredPhraseIds: string[]
}

const CampaignContext = createContext<CampaignContextValue>({
  phase: DEFAULT_CAMPAIGN_PHASE,
  featuredPhraseIds: DEFAULT_PRE_CAMPAIGN_PHRASE_IDS,
})

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<CampaignPhase>(DEFAULT_CAMPAIGN_PHASE)
  const [featuredPhraseIds, setFeaturedPhraseIds] = useState<string[]>(DEFAULT_PRE_CAMPAIGN_PHRASE_IDS)
  const [ready, setReady] = useState(false)

  useEffect(() => onSnapshot(
    doc(db, 'settings', 'campaign'),
    (snapshot) => {
      const settings = snapshot.exists() ? snapshot.data() : undefined
      const nextPhase = settings?.phase
      const nextFeaturedPhraseIds = Array.isArray(settings?.featuredPhraseIds)
        ? settings.featuredPhraseIds.filter(
            (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0,
          )
        : []
      setPhase(isCampaignPhase(nextPhase) ? nextPhase : DEFAULT_CAMPAIGN_PHASE)
      setFeaturedPhraseIds(
        nextFeaturedPhraseIds.length
          ? nextFeaturedPhraseIds.slice(0, 4)
          : DEFAULT_PRE_CAMPAIGN_PHRASE_IDS,
      )
      setReady(true)
    },
    (error) => {
      console.warn('Campaign setting unavailable; using the live campaign.', error)
      setPhase(DEFAULT_CAMPAIGN_PHASE)
      setReady(true)
    },
  ), [])

  const value = useMemo(() => ({ phase, featuredPhraseIds }), [featuredPhraseIds, phase])

  if (!ready) return <PageLoader />

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  return useContext(CampaignContext)
}
