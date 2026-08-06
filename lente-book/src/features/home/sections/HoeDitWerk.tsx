import SectionHeading from '../../../components/ui/SectionHeading'
import { hoeStappe } from '../../../lib/mockData'
import styles from './HoeDitWerk.module.css'

export default function HoeDitWerk() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <SectionHeading kicker="So werk dit" onCream>Wat is Lente Book?</SectionHeading>
        <div className={styles.grid}>
          {hoeStappe.map((s) => (
            <article key={s.nommer} className={`${styles.card} ${s.kleur}`}>
              <div className={styles.num}>{s.nommer}</div>
              <h3 className={styles.title}>{s.titel}</h3>
              <p className={styles.desc}>{s.beskrywing}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}