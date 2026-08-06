import { WOORDE_GEPLAK, fotos } from '../../../lib/mockData'
import styles from './Fotomuur.module.css'

export default function Fotomuur() {
  return (
    <section className={styles.hero}>
      <div className={styles.banner}>
        <p className={styles.kicker}>★ Lentedag 2026 ★</p>
        <h1 className={styles.wordmark}>Lente<span>Book</span></h1>
        <p className={styles.counter}>{WOORDE_GEPLAK.toLocaleString('af-ZA')} woorde geplak</p>
      </div>

      <div className={styles.wall}>
        {fotos.map((f) => (
          <figure key={f.id} className={styles.polaroid}>
            <div className={`${styles.photo} ${f.kleur}`} />
            <figcaption className={styles.cap}>
              <span className={styles.word}>{f.woord}</span>
              <span className={styles.handle}>{f.handle}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}