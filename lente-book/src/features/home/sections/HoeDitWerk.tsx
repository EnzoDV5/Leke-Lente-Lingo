import Section from '../../../components/ui/Section'
import Reveal from '../../../components/ui/Reveal'
import Button from '../../../components/ui/Button'
import SectionHeading from '../../../components/ui/SectionHeading'
import { hoeStappe } from '../../../lib/mockData'
import styles from './HoeDitWerk.module.css'

export default function HoeDitWerk() {
  return (
    <Section bg="paper" rondBo wydte="wyd">
      <SectionHeading kicker="So werk dit" onCream>Wat is Lente Book?</SectionHeading>
      <div className={styles.grid}>
        {hoeStappe.map((s, i) => (
          <Reveal key={s.nommer} delay={i * 120}>
            <article className={`${styles.card} ${s.kleur}`}>
              <div className={styles.num}>{s.nommer}</div>
              <h3 className={styles.title}>{s.titel}</h3>
              <p className={styles.desc}>{s.beskrywing}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <div className={styles.cta}>
        <Button kleur="oranje" grootte="lg" na="/woordeboek">Sien al die woorde →</Button>
      </div>
    </Section>
  )
}