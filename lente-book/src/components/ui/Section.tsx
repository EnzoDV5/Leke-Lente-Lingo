import type { CSSProperties, ReactNode, Ref } from 'react'
import styles from './Section.module.css'

type Props = {
  bg?: 'sky' | 'paper' | 'groen' | 'goud' | 'ink' | 'pienk' | 'blou' | 'pers'
  rondBo?: boolean        // ronde boonste hoeke + oorvleuel die vorige seksie
  rondOnder?: boolean     // ronde onderste hoeke
  wydte?: 'wyd' | 'lees' | 'nou'   // 72rem / 720px / 520px
  id?: string
  className?: string
  style?: CSSProperties
  sectionRef?: Ref<HTMLElement>
  children: ReactNode
}

export default function Section({
  bg = 'sky', rondBo = false, rondOnder = false, wydte = 'wyd', id, className = '', style, sectionRef, children,
}: Props) {
  const band = [styles.band, styles[bg], rondBo ? styles.rondBo : '', rondOnder ? styles.rondOnder : '', className].join(' ').trim()
  return (
    <section ref={sectionRef} id={id} className={band} style={style}>
      <div className={`${styles.binne} ${styles[wydte]}`}>{children}</div>
    </section>
  )
}
