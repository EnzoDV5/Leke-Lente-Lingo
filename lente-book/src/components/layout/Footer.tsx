import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const SOCIALS = [
  { label: 'Instagram', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></> },
  { label: 'Spotify', icon: <><circle cx="12" cy="12" r="10" /><path d="M6.5 9.2c3.9-1.1 8.2-.7 11.2 1" /><path d="M7.2 12.4c3.2-.8 6.8-.45 9.6 1" /><path d="M8 15.3c2.7-.55 5.5-.25 7.8.85" /></> },
  { label: 'TikTok', icon: <path d="M15.5 3v11.2a4.7 4.7 0 1 1-4-4.65v3.25a1.7 1.7 0 1 0 1 1.55V3h3c.35 2 1.5 3.15 3.5 3.45v3a7.3 7.3 0 0 1-3.5-1.05" /> },
  { label: 'YouTube', icon: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" /></> },
  { label: 'Facebook', icon: <path d="M14 21v-8h3l.5-3H14V8.3c0-1 .35-1.8 1.85-1.8H18V3.8c-.65-.1-1.55-.2-2.75-.2-2.8 0-4.75 1.7-4.75 4.9V10H8v3h2.5v8Z" /> },
]

export default function Footer() {
  return (
    <footer className={styles.foot}>
      <img className={`${styles.cloud} ${styles.cloudLeft}`} src="/elements/cloud3.webp" alt="" />
      <img className={`${styles.cloud} ${styles.cloudRight}`} src="/elements/cloud2.webp" alt="" />
      <img className={`${styles.star} ${styles.starOne}`} src="/elements/star1.webp" alt="" />
      <img className={`${styles.star} ${styles.starTwo}`} src="/elements/star2.webp" alt="" />
      <img className={`${styles.star} ${styles.starThree}`} src="/elements/star3.webp" alt="" />

      <div className={styles.inner}>
        <h2>SIEN JOU<br />DAAR!</h2>

        <img className={styles.logo} src="/elements/lentedag-logo.webp" alt="Lentedag" />

        <div className={styles.socials} aria-label="Lentedag sosiale media">
          {SOCIALS.map(({ label, icon }) => (
            <span className={styles.socialIcon} title={label} key={label}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg>
              <span className={styles.srOnly}>{label}</span>
            </span>
          ))}
        </div>

        <nav className={styles.links} aria-label="Voetskrif-kieslys">
          <Link to="/woordeboek" viewTransition>Woordeboek</Link>
          <Link to="/foto" viewTransition>Voeg Foto By</Link>
          <Link to="/woordjag" viewTransition>Lente Bingo</Link>
        </nav>

        <p className={styles.copy}>
          © 2026 Leke Lente Lingo · Lentedag Afrikaans Musiekfees · Pretoria
          <br />
          Gemaak met liefde vir Afrikaans. Geniet die fees verantwoordelik.
        </p>
      </div>
    </footer>
  )
}
