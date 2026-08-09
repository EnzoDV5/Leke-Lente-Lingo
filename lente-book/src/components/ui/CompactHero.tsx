import type { ReactNode } from 'react'
import styles from './CompactHero.module.css'

type CompactHeroProps = {
  kicker: string
  title: string
  className?: string
  subtitle?: string
  children?: ReactNode
  aboveKicker?: ReactNode
  topAction?: ReactNode
  compact?: boolean
  statement?: boolean
  detail?: boolean
}

export default function CompactHero({
  kicker,
  title,
  className = '',
  subtitle,
  children,
  aboveKicker,
  topAction,
  compact = false,
  statement = false,
  detail = false,
}: CompactHeroProps) {
  return (
    <header className={`${styles.hero} ${compact ? styles.compact : ''} ${detail ? styles.detail : ''} ${className}`}>
      {topAction && <div className={styles.topAction}>{topAction}</div>}
      <div className={styles.copy}>
        {aboveKicker}
        <p className={styles.kicker}>{kicker}</p>
        <h1 className={statement ? styles.statement : ''}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </header>
  )
}
