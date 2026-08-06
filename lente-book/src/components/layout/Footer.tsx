import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.foot}>
      <div className={styles.inner}>
        <p className={styles.brand}>Lente Book</p>
        <p className={styles.tag}>Lentedag Afrikaans Musiekfees · Pretoria · 2026</p>
        <ul className={styles.links}>
          <li><Link to="/woordeboek">Woordeboek</Link></li>
          <li><Link to="/foto">Voeg Foto By</Link></li>
          <li><Link to="/woordjag">Woordjag</Link></li>
        </ul>
        <p className={styles.copy}>© 2026 Leke Lente Lingo · Gemaak met liefde vir Afrikaans</p>
      </div>
    </footer>
  )
}