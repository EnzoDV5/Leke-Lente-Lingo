import toiletIcon from '../../assets/elements/poster elements/toilet-icon.webp'
import cupIcon from '../../assets/elements/poster elements/cup-icon.webp'
import speakerIcon from '../../assets/elements/poster elements/speaker-icon.webp'
import vapeIcon from '../../assets/elements/poster elements/vape.webp'
import type { FestivalArea } from '../../types'
import styles from './FestivalLocationLabel.module.css'

const LOCATIONS: Record<FestivalArea, { name: string; icon?: string }> = {
  bathroom: { name: 'Die Poep-Pods', icon: toiletIcon },
  smoking: { name: 'Die Choef-hoek', icon: vapeIcon },
  bar: { name: 'Die Dopstop', icon: cupIcon },
  stages: { name: 'Die Beats Blok', icon: speakerIcon },
}

export function festivalLocationName(area: FestivalArea) {
  return LOCATIONS[area].name
}

export default function FestivalLocationLabel({ area }: { area: FestivalArea }) {
  const location = LOCATIONS[area]

  return (
    <div className={styles.label}>
      {location.icon ? (
        <img src={location.icon} alt="" aria-hidden="true" />
      ) : (
        <span aria-hidden="true">✦</span>
      )}
      <strong>{location.name}</strong>
    </div>
  )
}
