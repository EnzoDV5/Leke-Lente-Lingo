import styles from './Marquee.module.css'

const ITEMS = ['Lentedag 2026', '16 September', 'Lente Book', 'Stem vir jou woord', 'Pretoria']

export default function Marquee() {
  const line = [...ITEMS, ...ITEMS] // duplicated so the loop is seamless
  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        {line.map((t, i) => <span key={i} className={styles.item}>★ {t}</span>)}
      </div>
    </div>
  )
}