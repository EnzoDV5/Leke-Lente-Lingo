import { Link } from 'react-router-dom'
import SectionHeading from '../../../components/ui/SectionHeading'
import styles from './Actions.module.css'

const AKSIES = [
  { to: '/woordeboek', label: 'Woordeboek',   icon: '📖', kleur: 'bg-blou text-paper'  },
  { to: '/foto',       label: 'Voeg Foto By', icon: '📸', kleur: 'bg-pienk text-paper' },
  { to: '/woordjag',   label: 'Woordjag',     icon: '🎯', kleur: 'bg-groen text-ink'   },
]

export default function Actions() {
  return (
    <section className={styles.wrap}>
      <SectionHeading>Wat wil jy doen?</SectionHeading>
      <div className={styles.grid}>
        {AKSIES.map((a) => (
          <Link key={a.label} to={a.to} className={`${styles.card} ${a.kleur}`}>
            <span className={styles.icon}>{a.icon}</span>
            <span className={styles.label}>{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}