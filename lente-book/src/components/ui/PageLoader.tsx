import lekeLenteLingoLogo from '../../assets/elements/Leke-lente-lingo.webp'
import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <main className={styles.loader} aria-live="polite" aria-label="Lente Book laai">
      <div className={styles.content}>
        <img className={styles.logo} src={lekeLenteLingoLogo} alt="Leke Lente Lingo" />
        <div className={styles.track} aria-hidden="true">
          <span className={styles.progress} />
          <span className={styles.spark} />
        </div>
        <p>LAAT DIE LENTE GROEI...</p>
      </div>
    </main>
  )
}
