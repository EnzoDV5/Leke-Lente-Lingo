import { useNavigate } from 'react-router-dom'

import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import type { ChallengeId } from './challengeConfig'
import styles from './ChallengeSuccess.module.css'

type Props = { challengeId: ChallengeId; title: string; text: string; icon: string }

export default function ChallengeSuccess({ challengeId, title, text, icon }: Props) {
  const navigate = useNavigate()
  useBodyScrollLock()
  const isRemoteFriend = challengeId === 'friend' && icon === '🌍'
  const isFriendInviter = challengeId === 'friend' && icon === '📲'
  const earnedChallengeId = isRemoteFriend ? 'doop' : challengeId
  const rewardText = isRemoteFriend
    ? 'Jou nuwe woord is geskep. Jy het die Merk Dit-poster verdien, en jou maat het Challenge ’n Chommie verdien.'
    : isFriendInviter
      ? 'Jou maat het die woord geskep. Jy het Challenge ’n Chommie verdien, en jou maat het Merk Dit verdien.'
      : text

  return (
    <div className={styles.backdrop} role="presentation">
      <section className={styles.card} role="dialog" aria-modal="true" aria-labelledby="challenge-success-title">
        <div className={styles.burst} aria-hidden="true">✦</div>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
        <p className={styles.kicker}>UITDAGING VOLTOOI</p>
        <h2 id="challenge-success-title">{title}</h2>
        <p className={styles.copy}>{rewardText}</p>
        <div className={styles.posterStamp}><span>✓</span><div><strong>POSTER VERDIEN</strong><small>Dit wag in jou versameling</small></div></div>
        <button type="button" onClick={() => navigate(`/woordjag?collected=${earnedChallengeId}`, { replace: true })}>Klaar · Wys my poster</button>
      </section>
    </div>
  )
}
