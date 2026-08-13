import { Link } from 'react-router-dom'
import Section from '../../../components/ui/Section'
import Reveal from '../../../components/ui/Reveal'
import SectionHeading from '../../../components/ui/SectionHeading'
import styles from './Actions.module.css'

const AKSIES = [
  { to: '/woordeboek', label: 'Woordeboek',   icon: '📖', kleur: 'bg-blou text-paper'  },
  { to: '/foto',       label: 'Voeg Foto', icon: '📸', kleur: 'bg-pienk text-paper' },
  { to: '/collections', label: 'Lente Bingo', icon: '🎯', kleur: 'bg-groen text-ink' },
]

export default function Actions() {
  return (
    <Section bg="sky" wydte="wyd">
      <SectionHeading>Wat wil jy doen?</SectionHeading>
      <div className={styles.grid}>
        {AKSIES.map((a, i) => (
          <Reveal key={a.label} delay={i * 120}>
            <Link to={a.to} viewTransition className={`${styles.card} ${a.kleur}`}>
              <span className={styles.icon}>{a.icon}</span>
              <span className={styles.label}>{a.label}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
