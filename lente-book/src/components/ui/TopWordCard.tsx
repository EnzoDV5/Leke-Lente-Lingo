import { Link } from 'react-router-dom'
import { fallbackProfileAvatar } from '../../lib/profileAvatars'
import lentedagSecondaryLogo from '../../assets/elements/LENTEDAG-logo2.webp'
import type { Frase, Woord } from '../../types'
import styles from './TopWordCard.module.css'

export default function TopWordCard({ phrase, word, rank }: { phrase: Frase; word: Woord; rank: number }) {
  return (
    <Link className={`${styles.card} ${rank <= 3 ? styles[`rank${rank}`] : ''}`} to={`/woordeboek/${phrase.id}?word=${word.id}`} viewTransition>
      <span className={styles.rank}>{rank === 1 ? '👑' : rank}</span>
      <img className={word.handle === '@lentedag' ? styles.brandAvatar : ''} src={word.handle === '@lentedag' ? lentedagSecondaryLogo : fallbackProfileAvatar(word.handle)} alt="" />
      <span className={styles.copy}><strong>{word.woord}</strong><small>{word.handle}</small></span>
      <span className={styles.votes}>👍 <b>{word.stemme}</b></span>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </Link>
  )
}
