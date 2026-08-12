import type { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

type SkeletonProps = {
  width?: string | number
  height?: string | number
  circle?: boolean
  radius?: string | number
  delay?: number
  className?: string
  style?: CSSProperties
}

export default function Skeleton({
  width,
  height,
  circle = false,
  radius,
  delay = 0,
  className = '',
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.skeleton} ${circle ? styles.circle : ''} ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : radius,
        '--skeleton-delay': `${delay}ms`,
        ...style,
      } as CSSProperties}
    />
  )
}
