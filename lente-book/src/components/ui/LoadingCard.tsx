import Skeleton from './Skeleton'
import styles from './LoadingCard.module.css'

export default function LoadingCard({ label }: { label: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.card}>
        <Skeleton circle width={54} height={54} />
        <div className={styles.lines}>
          <Skeleton width="72%" height="1.05rem" radius={8} delay={90} />
          <Skeleton width="46%" height=".8rem" radius={8} delay={170} />
        </div>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
