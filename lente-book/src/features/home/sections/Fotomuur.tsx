import { fotos } from '../../../lib/mockData'
import {
  useLiveWordCount,
} from '../../../hooks/useLiveWords'

import styles from './Fotomuur.module.css'

export default function Fotomuur() {
  const {
    count,
    loading,
  } = useLiveWordCount()

  return (
    <section className={styles.hero}>
      <div className={styles.banner}>
        <p className={styles.kicker}>
          ★ Lentedag 2026 ★
        </p>

        <h1 className={styles.wordmark}>
          Lente<span>Book</span>
        </h1>

        <p className={styles.counter}>
          {loading
            ? 'Woorde word getel...'
            : `${count.toLocaleString(
                'af-ZA',
              )} woorde geplak`}
        </p>
      </div>

      <div className={styles.wall}>
        {fotos.map((foto) => (
          <figure
            key={foto.id}
            className={styles.polaroid}
          >
            <div
              className={`${styles.photo} ${foto.kleur}`}
            />

            <figcaption
              className={styles.cap}
            >
              <span
                className={styles.word}
              >
                {foto.woord}
              </span>

              <span
                className={styles.handle}
              >
                {foto.handle}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}