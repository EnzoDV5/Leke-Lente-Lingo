import { Link } from 'react-router-dom'
import { bgKleur, tekstKleur } from '../../lib/kleur'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import lentedagSecondaryLogo from '../../assets/elements/LENTEDAG-logo2.webp'
import type { Frase } from '../../types'
import styles from './PhraseCard.module.css'

export default function PhraseCard({ frase }: { frase: Frase }) {
  const top = [...frase.woorde].sort((a, b) => b.stemme - a.stemme)[0]
  const phraseAuthor = frase.createdByUsername ?? '@lentebook'
  const phraseAvatar = frase.createdByUsername
    ? resolveProfileAvatar(frase.createdByAvatar) ?? fallbackProfileAvatar(phraseAuthor)
    : lentedagSecondaryLogo
  const wordAvatar = top ? fallbackProfileAvatar(top.handle) : ''

  return (
    <article className={styles.card} style={{ background: bgKleur(frase.kleur), color: tekstKleur(frase.kleur) }}>
      <div className={styles.author}>
        <img className={!frase.createdByUsername ? styles.officialLogo : ''} src={phraseAvatar} alt="" />
        <span>
          <small>{frase.createdByUsername ? 'Nuwe frase deur' : frase.bord}</small>
          <strong>{phraseAuthor}</strong>
        </span>
      </div>
      <p className={styles.frase}>{frase.beskrywing}</p>
      <div className={styles.balk}>
        <div className={styles.top}>
          {top && (
            <>
              <img className={`${styles.wordAvatar} ${top.handle === '@lentedag' ? styles.brandWordAvatar : ''}`} src={top.handle === '@lentedag' ? lentedagSecondaryLogo : wordAvatar} alt="" />
              <span className={styles.wordCopy}>
                <small>Gewildste woord</small>
                <strong className={styles.woord}>{top.woord}</strong>
                <span className={styles.meta}>{top.handle}</span>
              </span>
            </>
          )}
        </div>
        <div className={styles.actions}>
          {top && <span className={styles.cardVotes}>👍 <b>{top.stemme}</b></span>}
          <Link to={`/woordeboek/${frase.id}`} className={styles.knoppie}>Meer <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  )
}
