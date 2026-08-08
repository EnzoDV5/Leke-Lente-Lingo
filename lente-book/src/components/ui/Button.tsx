import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Kleur = 'pienk' | 'blou' | 'groen' | 'goud' | 'oranje' | 'pers' | 'paper' | 'ink'
type Grootte = 'sm' | 'md' | 'lg'

type Props = {
  kleur?: Kleur
  grootte?: Grootte
  vorm?: 'pil' | 'kaart'
  blok?: boolean          // volle breedte
  na?: string             // interne roete (react-router Link)
  href?: string           // eksterne skakel
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  kleur = 'pienk', grootte = 'md', vorm = 'pil', blok = false,
  na, href, className = '', children, ...rest
}: Props) {
  const cls = [
    styles.knop, styles[kleur], styles[grootte], styles[vorm],
    blok ? styles.blok : '', className,
  ].join(' ').trim()

  if (na)   return <Link to={na} className={cls}>{children}</Link>
  if (href) return <a href={href} className={cls} target="_blank" rel="noreferrer">{children}</a>
  return <button className={cls} {...rest}>{children}</button>
}