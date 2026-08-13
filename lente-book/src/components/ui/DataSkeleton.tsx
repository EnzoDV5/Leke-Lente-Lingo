import Skeleton from './Skeleton'
import styles from './DataSkeleton.module.css'

type DataSkeletonProps = {
  variant?: 'list' | 'cards' | 'podium'
  count?: number
  label?: string
}

export default function DataSkeleton({
  variant = 'list',
  count = 4,
  label = 'Inhoud word gelaai',
}: DataSkeletonProps) {
  if (variant === 'podium') {
    return (
      <div className={styles.podium} role="status" aria-label={label}>
        {[2, 1, 3].map((rank, index) => (
          <div className={styles.podiumColumn} key={rank}>
            <Skeleton circle width={70} height={70} delay={index * 100} />
            <Skeleton width="58%" height=".8rem" radius={8} delay={index * 100 + 45} />
            <Skeleton className={styles.podiumBlock} width="100%" height={rank === 1 ? 330 : rank === 2 ? 255 : 205} radius="26px 26px 0 0" delay={index * 100 + 90} />
          </div>
        ))}
        <span className={styles.srOnly}>{label}</span>
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={styles.cards} role="status" aria-label={label}>
        {Array.from({ length: count }).map((_, index) => (
          <article className={styles.card} key={index}>
            <Skeleton circle width={46} height={46} delay={index * 80} />
            <div>
              <Skeleton width={`${72 - (index % 2) * 12}%`} height="1rem" radius={7} delay={index * 80 + 35} />
              <Skeleton width="92%" height=".72rem" radius={7} delay={index * 80 + 70} />
              <Skeleton width="64%" height=".72rem" radius={7} delay={index * 80 + 105} />
            </div>
          </article>
        ))}
        <span className={styles.srOnly}>{label}</span>
      </div>
    )
  }

  return (
    <div className={styles.list} role="status" aria-label={label}>
      {Array.from({ length: count }).map((_, index) => {
        const delay = index * 75
        return (
          <div className={styles.row} key={index}>
            <Skeleton width={28} height={18} radius={6} delay={delay} />
            <Skeleton circle width={44} height={44} delay={delay + 25} />
            <div>
              <Skeleton width={`${68 - (index % 3) * 8}%`} height="1rem" radius={7} delay={delay + 50} />
              <Skeleton width={`${42 + (index % 2) * 14}%`} height=".68rem" radius={7} delay={delay + 75} />
            </div>
            <Skeleton width={70} height={40} radius={12} delay={delay + 100} />
          </div>
        )
      })}
      <span className={styles.srOnly}>{label}</span>
    </div>
  )
}
