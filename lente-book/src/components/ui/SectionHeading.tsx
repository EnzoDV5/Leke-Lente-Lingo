import styles from './SectionHeading.module.css'

type Props = { kicker?: string; onCream?: boolean; children: React.ReactNode }

export default function SectionHeading({ kicker, onCream, children }: Props) {
  return (
    <div className={styles.head}>
      {kicker && <p className={styles.kicker}>{kicker}</p>}
      <h2 className={`${styles.title} ${onCream ? styles.onCream : ''}`}>{children}</h2>
    </div>
  )
}