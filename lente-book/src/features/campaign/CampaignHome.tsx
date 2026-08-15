import Home from '../home/Home'
import AfterCampaignHome from './AfterCampaignHome'
import PreCampaignHome from './PreCampaignHome'
import { useCampaign } from './CampaignProvider'

export default function CampaignHome() {
  const { phase } = useCampaign()

  if (phase === 'pre') return <PreCampaignHome />
  if (phase === 'post') return <AfterCampaignHome />

  return <Home />
}
