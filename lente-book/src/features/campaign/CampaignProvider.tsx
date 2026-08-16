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

// TEMP demo override: ?phase=pre / ?phase=live / ?phase=post on any URL
// pins the site to that phase for the whole session, ignoring the live
// Firestore setting — so you can hand out 3 fixed links that each always
// show one campaign phase, instead of everyone seeing whatever the real
// site is currently set to. Captured once on first load so it survives
// in-app navigation even after the query string is gone. Remove this
// block (and the demoPhaseOverride check below) once the 3 demo links are
// no longer needed.
function readDemoPhaseOverride(): CampaignPhase | null {
  if (typeof window === 'undefined') return null
  const requested = new URLSearchParams(window.location.search).get('phase')
  return isCampaignPhase(requested) ? requested : null
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [demoPhaseOverride] = useState(readDemoPhaseOverride)
  const [phase, setPhase] = useState<CampaignPhase>(demoPhaseOverride ?? DEFAULT_CAMPAIGN_PHASE)
  const [featuredPhraseIds, setFeaturedPhraseIds] = useState<string[]>(DEFAULT_PRE_CAMPAIGN_PHRASE_IDS)
  const [ready, setReady] = useState(Boolean(demoPhaseOverride))

  useEffect(() => {
    // A demo link pins the phase outright — skip subscribing to the real
    // campaign setting entirely so it can never override the demo view.
    if (demoPhaseOverride) return

    return onSnapshot(
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
    )
  }, [demoPhaseOverride])

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
