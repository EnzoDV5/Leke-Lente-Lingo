export type CampaignPhase = 'pre' | 'live' | 'post'

export const DEFAULT_CAMPAIGN_PHASE: CampaignPhase = 'live'

// These 4 must match the scenarios used in the pre-campaign Instagram posts
// exactly — see officialPhraseCopy.ts for the shared wording.
export const DEFAULT_PRE_CAMPAIGN_PHRASE_IDS = [
  'poep-pods-warm-seat',
  'choef-hoek-pull',
  'beats-blok-drinks',
  'beats-blok-bass',
]

export type CampaignNavigationItem = {
  to: string
  label: string
}

export const CAMPAIGN_NAVIGATION: Record<CampaignPhase, CampaignNavigationItem[]> = {
  pre: [
    { to: '/', label: 'Tuis' },
  ],
  live: [
    { to: '/', label: 'Tuis' },
    { to: '/woordeboek', label: 'Woordeboek' },
    { to: '/collections', label: 'Lente Bingo' },
    { to: '/foto', label: 'Voeg Foto' },
  ],
  post: [
    { to: '/woordeboek', label: 'Woordeboek' },
  ],
}

export function isCampaignPhase(value: unknown): value is CampaignPhase {
  return value === 'pre' || value === 'live' || value === 'post'
}
