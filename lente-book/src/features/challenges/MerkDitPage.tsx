import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import DataSkeleton from '../../components/ui/DataSkeleton'
import LoadingCard from '../../components/ui/LoadingCard'
import FestivalLocationLabel from '../../components/ui/FestivalLocationLabel'
import { useLivePhrases, type LivePhrase } from '../../hooks/useLivePhrases'
import { useLiveWords } from '../../hooks/useLiveWords'
import { frases } from '../../lib/mockData'
import { addWord } from '../../lib/wordService'
import { completeChallenge } from '../../lib/challengeProgress'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import { useAuth } from '../auth/AuthContext'
import type { FestivalArea } from '../../types'
import styles from './MerkDitPage.module.css'
import ChallengeSuccess from './ChallengeSuccess'
import { useScannedPosterClaim } from '../../hooks/useScannedPosterClaim'

type DisplayPhrase = Pick<LivePhrase, 'id' | 'text' | 'area' | 'boardNumber'>

export default function MerkDitPage() {
  const { phraseId = '' } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const { phrases: livePhrases, loading: phrasesLoading } = useLivePhrases()
  const scannedArea = searchParams.get('area') as FestivalArea | null
  const fromScan = searchParams.get('scan') === '1' || Boolean(scannedArea)
  const { claimed } = useScannedPosterClaim(user?.uid, 'doop', fromScan)
  const claimedByScanRouter = Boolean(
    (location.state as { posterJustClaimed?: boolean } | null)
      ?.posterJustClaimed,
  )

  const availablePhrases = useMemo<DisplayPhrase[]>(() => {
    const fallback = frases.map((phrase, index) => ({ id: phrase.id, text: phrase.beskrywing, area: phrase.area, boardNumber: index + 1 }))
    const all = livePhrases.length ? livePhrases : fallback
    const scannedPhrase = all.find((phrase) => phrase.id === phraseId)
    const area = scannedArea || scannedPhrase?.area
    return area ? all.filter((phrase) => phrase.area === area) : all
  }, [livePhrases, phraseId, scannedArea])

  const initialIndex = Math.max(0, availablePhrases.findIndex((phrase) => phrase.id === phraseId))
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const activePhrase = availablePhrases[activeIndex] ?? availablePhrases[0]

  useEffect(() => setActiveIndex(initialIndex), [initialIndex])

  if (phrasesLoading) return <div className={styles.loading}><LoadingCard label="Frases word reggesit…" /></div>
  if (!activePhrase) return <p className={styles.loading}>Hierdie poster se frases kon nie gevind word nie.</p>

  const move = (direction: -1 | 1) => setActiveIndex((index) => (index + direction + availablePhrases.length) % availablePhrases.length)

  return (
    <section className={styles.page} data-area={activePhrase.area}>
      {(claimed || claimedByScanRouter) && <ChallengeSuccess challengeId="doop" icon="✏️" unlockOnly title="Merk Dit ontsluit!" text="Jy het hierdie uitdaging reeds voltooi, so die QR-kode het jou poster onmiddellik ontsluit." />}
      <CompactHero
        className={styles.doopHero}
        kicker="01 · MERK DIT"
        title={activePhrase.text}
        statement
        detail
        topAction={<Link to="/collections" className={styles.back}><span aria-hidden="true">←</span> My posters</Link>}
      >
        <div className={styles.heroPhraseControls}>
          <button type="button" onClick={() => move(-1)} aria-label="Vorige frase">‹</button>
          <div>
            <small>FRASE {activeIndex + 1} VAN {availablePhrases.length}</small>
            <FestivalLocationLabel area={activePhrase.area} />
            <span className={styles.heroDots}>{availablePhrases.map((phrase, index) => <button key={phrase.id} type="button" className={index === activeIndex ? styles.activeHeroDot : ''} onClick={() => setActiveIndex(index)} aria-label={`Wys frase ${index + 1}`} />)}</span>
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Volgende frase">›</button>
        </div>
      </CompactHero>

      <div className={styles.wrap}>
        <PhraseChallenge key={activePhrase.id} phrase={activePhrase} fromScan={fromScan} user={user!} profile={profile!} />
      </div>
    </section>
  )
}

function PhraseChallenge({ phrase, fromScan, user, profile }: { phrase: DisplayPhrase; fromScan: boolean; user: NonNullable<ReturnType<typeof useAuth>['user']>; profile: NonNullable<ReturnType<typeof useAuth>['profile']> }) {
  const { words, loading } = useLiveWords(phrase.id, user.uid)
  const mockPhrase = frases.find((item) => item.id === phrase.id)
  const [newWord, setNewWord] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const displayWords = words.length ? words.map((word) => ({ id: word.id, text: word.text, username: word.createdByUsername, avatar: resolveProfileAvatar(word.createdByAvatar) ?? fallbackProfileAvatar(word.createdByUid), likes: word.upVotes })) : (mockPhrase?.woorde ?? []).map((word) => ({ id: word.id, text: word.woord, username: word.handle, avatar: fallbackProfileAvatar(word.handle), likes: word.stemme }))

  const submit = async () => {
    if (newWord.trim().length < 2 || submitting) { setMessage('Jou woord moet minstens 2 karakters hê.'); return }
    setSubmitting(true); setMessage('')
    try {
      const cleanWord = newWord.trim()
      const wordId = await addWord({ text: cleanWord, phraseId: phrase.id, phraseText: phrase.text, area: phrase.area, user, profile })
      await completeChallenge(user.uid, 'doop', fromScan, { kind: 'word', word: cleanWord, phrase: phrase.text, area: phrase.area, itemId: wordId })
      setNewWord('')
      setMessage(fromScan ? 'Mooi! Jou woord is ingesit en die poster is versamel.' : 'Mooi! Jou nuwe woord is ingesit.')
      setCompleted(fromScan)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ons kon nie jou woord insit nie.')
    } finally { setSubmitting(false) }
  }

  return (
    <article className={styles.challenge}>
      {completed && <ChallengeSuccess challengeId="doop" icon="✏️" title="Jou woord is gebore!" text="Jy het ’n splinternuwe woord vir die frase geskep. Jou Merk Dit-poster is gereed." />}
      <div className={styles.creator}>
        <label htmlFor="doop-word">Merk dit met jou eie woord</label>
        <div><input ref={inputRef} id="doop-word" value={newWord} maxLength={40} placeholder="Skryf jou nuwe woord…" onChange={(event) => setNewWord(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void submit()} /><button type="button" disabled={submitting || newWord.trim().length < 2} onClick={() => void submit()}>{submitting ? 'Sit in…' : 'Sit my woord in'}</button></div>
        <small>Ingesit as {profile.username}</small>
        {message && <p role="status">{message}</p>}
      </div>

      <section className={styles.words}>
        <div className={styles.wordsHeading}><div><small>WOORDE VIR HIERDIE FRASE</small><h2>Wat ander mense dit noem</h2></div><strong>{displayWords.length}</strong></div>
        {loading ? <DataSkeleton count={4} label="Woorde vir hierdie frase word gelaai" /> : <ul>{displayWords.sort((a, b) => b.likes - a.likes).map((word, index) => <li key={word.id}><span className={styles.rank}>{index === 0 ? '★' : `#${index + 1}`}</span><img src={word.avatar} alt="" /><div><strong>{word.text}</strong><small>{word.username}</small></div><b>♥ {word.likes}</b></li>)}</ul>}
      </section>
    </article>
  )
}
