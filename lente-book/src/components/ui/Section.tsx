import type { ReactNode } from 'react'
import styles from './Section.module.css'

type Props = {
  bg?: 'sky' | 'paper' | 'groen' | 'goud' | 'ink' | 'pienk' | 'blou' | 'pers'
  rondBo?: boolean        // ronde boonste hoeke + oorvleuel die vorige seksie
  rondOnder?: boolean     // ronde onderste hoeke
  wydte?: 'wyd' | 'lees' | 'nou'   // 72rem / 720px / 520px
  id?: string
  className?: string
  children: ReactNode
}

export default function Section({
  bg = 'sky', rondBo = false, rondOnder = false, wydte = 'wyd', id, className = '', children,
}: Props) {
  const band = [styles.band, styles[bg], rondBo ? styles.rondBo : '', rondOnder ? styles.rondOnder : '', className].join(' ').trim()
  return (
    <section id={id} className={band}>
      <div className={`${styles.binne} ${styles[wydte]}`}>{children}</div>
    </section>
  )
}