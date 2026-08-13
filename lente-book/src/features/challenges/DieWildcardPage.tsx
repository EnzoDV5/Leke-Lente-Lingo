import { useState } from 'react'
import { Link } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import LoadingCard from '../../components/ui/LoadingCard'
import { useChallengeProgress } from '../../hooks/useChallengeProgress'
import { createWildcardCreation } from '../../lib/wildcardService'
import { useAuth } from '../auth/AuthContext'
import ChallengeSuccess from './ChallengeSuccess'
import { CORE_CHALLENGE_IDS } from './challengeConfig'
import styles from './DieWildcardPage.module.css'

export default function DieWildcardPage() {
  const { user, profile } = useAuth()
  const { wildcardUnlocked, collectedCount, progress, loading } = useChallengeProgress(user?.uid)
  const [phrase, setPhrase] = useState('')
  const [word, setWord] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  const phraseReady = phrase.trim().length >= 12
  const wordReady = word.trim().length >= 2

  const publish = async () => {
    if (!user || !profile || !phraseReady || !wordReady || submitting) return
    if (progress.wildcard.challengeCompleted) {
      setMessage('Jy het reeds jou Wildcard geskep en versamel.')
      return
    }
    setSubmitting(true); setMessage('')
    try { await createWildcardCreation({ phraseText: phrase, wordText: word, user, profile }); setCompleted(true) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Ons kon nie jou Wildcard publiseer nie.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className={styles.loading}><LoadingCard label="Wildcard word ontsluit…" /></div>
  if (!wildcardUnlocked) return <section className={styles.locked}><span>🔒</span><small>07 · WILDCARD</small><h1>Versamel eers ses posters</h1><p>Jy het {Math.min(collectedCount, CORE_CHALLENGE_IDS.length)} van {CORE_CHALLENGE_IDS.length}. Die Wildcard maak oop wanneer jou kernstel voltooi is.</p><div><i style={{ width: `${Math.min(collectedCount / CORE_CHALLENGE_IDS.length, 1) * 100}%` }} /></div><Link to="/collections"><span aria-hidden="true">←</span> Terug na my posters</Link></section>

  return <section className={styles.page}>{completed && <ChallengeSuccess challengeId="wildcard" icon="⚡" title="Jy het taalgeskiedenis gemaak!" text={`“${word}” is gebore vir jou eie Wildcard-frase. Die hele skepping is nou deel van Lente Book.`} />}<CompactHero className={styles.hero} kicker="07 · DIE WILDCARD" title="Skep die frase én die woord." statement detail topAction={<Link to="/collections" className={styles.back}><span aria-hidden="true">←</span> My posters</Link>}><div className={styles.special}><span>⚡</span><p>Geen bord gee vir jou die scenario nie, hierdie een kom heeltemal uit jou kop.</p></div></CompactHero><div className={styles.wrap}><ol className={styles.steps}><li className={phraseReady ? styles.done : styles.active}><span>01</span><div><strong>Skep die frase</strong><small>Dink die scenario uit</small></div></li><li className={wordReady ? styles.done : phraseReady ? styles.active : ''}><span>02</span><div><strong>Doop dit</strong><small>Skep die nuwe woord</small></div></li><li className={phraseReady && wordReady ? styles.active : ''}><span>03</span><div><strong>Publiseer</strong><small>Stuur dit die wêreld in</small></div></li></ol><section className={styles.studio}><div className={styles.form}><article><header><span>01</span><div><small>JOU EIE SCENARIO</small><h2>Skep ’n frase</h2></div>{phraseReady && <b>✓</b>}</header><p>Skryf dit op jou manier. Byvoorbeeld: “Wat noem jy dit wanneer…”</p><textarea value={phrase} maxLength={180} placeholder="Wat noem jy dit wanneer…" onChange={(event) => setPhrase(event.target.value)} /><footer><span>{phrase.length}/180</span><em>{phraseReady ? 'Frase gereed' : 'Minstens 12 karakters'}</em></footer></article><article className={!phraseReady ? styles.disabledStep : ''}><header><span>02</span><div><small>JOU NUWE WOORD</small><h2>Doop jou frase</h2></div>{wordReady && <b>✓</b>}</header><p>Maak dit kort, slim en lekker om hardop te sê.</p><input value={word} disabled={!phraseReady} maxLength={40} placeholder="Jou splinternuwe woord…" onChange={(event) => setWord(event.target.value)} /><footer><span>{word.length}/40</span><em>{wordReady ? 'Woord gereed' : 'Minstens 2 karakters'}</em></footer></article></div><aside className={styles.preview}><small>REGSTREEKSE VOORSKOU</small><span className={styles.bolt}>⚡</span><p>{phrase.trim() || 'Jou oorspronklike Wildcard-frase verskyn hier…'}</p><strong>{word.trim() || 'JOU WOORD'}</strong><div><small>{profile?.username}</small></div><button type="button" disabled={!phraseReady || !wordReady || submitting || progress.wildcard.challengeCompleted} onClick={() => void publish()}>{submitting ? 'Publiseer tans…' : progress.wildcard.challengeCompleted ? 'Wildcard reeds versamel ✓' : 'Publiseer my Wildcard'}</button>{message && <em className={styles.message}>{message}</em>}</aside></section></div></section>
}
