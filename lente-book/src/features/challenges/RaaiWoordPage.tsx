import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { useLivePhrases } from '../../hooks/useLivePhrases'
import { completeChallenge } from '../../lib/challengeProgress'
import { frases } from '../../lib/mockData'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import { useAuth } from '../auth/AuthContext'
import type { FestivalArea } from '../../types'
import styles from './RaaiWoordPage.module.css'
import ChallengeSuccess from './ChallengeSuccess'

const AREA_NAMES: Record<FestivalArea, string> = { bathroom: 'Die Poep-Pods', smoking: 'Die Choef-hoek', bar: 'Die Dopstop', stages: 'Die Beats Blok' }

export default function RaaiWoordPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { words: liveWords, loading: wordsLoading } = useLeaderboard()
  const { phrases: livePhrases, loading: phrasesLoading } = useLivePhrases()
  const fromScan = searchParams.get('scan') === '1'
  const requestedArea = searchParams.get('area') as FestivalArea | null

  const phrasesList = useMemo(() => {
    const fallback = frases.map((phrase, index) => ({ id: phrase.id, text: phrase.beskrywing, area: phrase.area, boardNumber: index + 1 }))
    const all = livePhrases.length ? livePhrases : fallback
    return requestedArea ? all.filter((phrase) => phrase.area === requestedArea) : all
  }, [livePhrases, requestedArea])
  const candidates = useMemo(() => {
    const validIds = new Set(phrasesList.map((phrase) => phrase.id))
    const live = liveWords.filter((word) => validIds.has(word.phraseId)).map((word) => ({ ...word, username: word.createdByUsername, avatar: resolveProfileAvatar(word.createdByAvatar) ?? fallbackProfileAvatar(word.createdByUid) }))
    if (live.length) return live
    return frases.filter((phrase) => validIds.has(phrase.id)).flatMap((phrase) => phrase.woorde.map((word) => ({ id: word.id, text: word.woord, phraseId: phrase.id, username: word.handle, avatar: fallbackProfileAvatar(word.handle), upVotes: word.stemme, downVotes: 0, score: word.stemme, totalVotes: word.stemme, createdByUid: '', createdByUsername: word.handle, createdByAvatar: '' })))
  }, [liveWords, phrasesList])

  const [round, setRound] = useState(() => Math.floor(Math.random() * 100000))
  const [selectedPhraseId, setSelectedPhraseId] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [completed, setCompleted] = useState(false)
  const word = candidates.length ? candidates[round % candidates.length] : null

  useEffect(() => { setSelectedPhraseId(''); setResult(null) }, [round, word?.id])
  const guess = async (phraseId: string) => {
    if (!word || result !== null) return
    setSelectedPhraseId(phraseId)
    if (phraseId === word.phraseId) {
      setResult('correct')
      if (user) await completeChallenge(user.uid, 'guess', true)
      setCompleted(true)
    } else setResult('wrong')
  }
  const nextWord = () => setRound((value) => value + 1 + Math.floor(Math.random() * Math.max(1, candidates.length - 1)))

  if ((wordsLoading || phrasesLoading) && (!word || !phrasesList.length)) return <p className={styles.loading}>Jou raaisel word gebou…</p>
  if (!word) return <p className={styles.loading}>Daar is nog nie genoeg woorde vir hierdie raaisel nie.</p>

  return (
    <section className={styles.page}>
      {completed && <ChallengeSuccess challengeId="guess" icon="👀" title="Reg geraai!" text="Jy het die geheime woord by sy oorspronklike frase gepas." />}
      <CompactHero className={styles.guessHero} kicker="03 · RAAI DIE WOORD" title="By watter frase hoort dié woord?" statement detail topAction={<Link to="/woordjag" className={styles.back}><span>←</span> My plakkate</Link>}>
        <div className={styles.mysteryWord}><img src={word.avatar} alt="" /><div><small>DIE GEHEIME WOORD</small><strong>{word.text}</strong><span>{word.username} · 👍 {word.upVotes}</span></div></div>
      </CompactHero>
      <div className={styles.wrap}>
        <header className={styles.instructions}><div><small>STAP 1 · PAS DIT</small><h2>Kies die oorspronklike frase</h2><p>Watter scenario dink jy het hierdie woord geïnspireer?</p></div><strong>{phrasesList.length}</strong></header>
        <div className={styles.mobileHint}>← Swiep deur die frases →</div>
        <div className={styles.choices} aria-label="Frase-keuses">{phrasesList.map((phrase, index) => {
          const selected = selectedPhraseId === phrase.id
          const correct = result !== null && phrase.id === word.phraseId
          const wrong = result === 'wrong' && selected
          return <button key={phrase.id} type="button" className={`${styles.choice} ${correct ? styles.correct : ''} ${wrong ? styles.wrong : ''}`} onClick={() => void guess(phrase.id)} disabled={result !== null}><span>0{index + 1}</span><div><small>{AREA_NAMES[phrase.area]}</small><strong>{phrase.text}</strong></div><i>{correct ? '✓' : wrong ? '×' : 'KIES'}</i></button>
        })}</div>
        {result && <section className={`${styles.feedback} ${result === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong}`} role="status"><span>{result === 'correct' ? '✓' : '×'}</span><div><strong>{result === 'correct' ? 'Reg geraai!' : 'Nie heeltemal nie.'}</strong><p>{result === 'correct' ? (fromScan ? 'Die Raai die Woord-plakkaat is nou versamel.' : 'Jy het die woord by sy frase gepas.') : 'Dit was jou een raai. Die regte frase is in groen gewys.'}</p></div>{result === 'wrong' && <button type="button" onClick={nextWord}>Probeer ’n nuwe woord →</button>}</section>}
      </div>
    </section>
  )
}
