import { Link } from 'react-router-dom'
import { bgKleur, tekstKleur } from '../../lib/kleur'
import type { Frase } from '../../types'
import styles from './PhraseCard.module.css'

export default function PhraseCard({ frase }: { frase: Frase }) {
  const top = [...frase.woorde].sort((a, b) => b.stemme - a.stemme)[0]
  return (
    <article className={styles.card} style={{ background: bgKleur(frase.kleur), color: tekstKleur(frase.kleur) }}>
      <p className={styles.frase}>{frase.beskrywing}</p>
      <div className={styles.balk}>
        <div className={styles.top}>
          {top && (
            <>
              <span className={styles.kroon}>👑</span>
              <span className={styles.woord}>{top.woord}</span>
              <span className={styles.meta}>{top.handle} · {top.stemme} stemme</span>
            </>
          )}
        </div>
        <Link to={`/woordeboek/${frase.id}`} className={styles.knoppie}>{frase.woorde.length} woorde →</Link>
      </div>
    </article>
  )
}