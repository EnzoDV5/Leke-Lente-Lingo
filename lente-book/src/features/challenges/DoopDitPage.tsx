import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import { useLivePhrases, type LivePhrase } from '../../hooks/useLivePhrases'
import { useLiveWords } from '../../hooks/useLiveWords'
import { frases } from '../../lib/mockData'
import { addWord } from '../../lib/wordService'
import { completeChallenge } from '../../lib/challengeProgress'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import { useAuth } from '../auth/AuthContext'
import type { FestivalArea } from '../../types'
import styles from './DoopDitPage.module.css'
import ChallengeSuccess from './ChallengeSuccess'

type DisplayPhrase = Pick<LivePhrase, 'id' | 'text' | 'area' | 'boardNumber'>

const AREA_NAMES: Record<FestivalArea, string> = {
  bathroom: 'Die Poep-Pods', smoking: 'Die Choef-hoek', bar: 'Die Dopstop', stages: 'Die Beats Blok',
}

export default function DoopDitPage() {
  const { phraseId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const { phrases: livePhrases, loading: phrasesLoading } = useLivePhrases()
  const scannedArea = searchParams.get('area') as FestivalArea | null
  const fromScan = searchParams.get('scan') === '1'

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

  if (phrasesLoading && !availablePhrases.length) return <p className={styles.loading}>Frases word gelaai…</p>
  if (!activePhrase) return <p className={styles.loading}>Hierdie plakkaat se frases kon nie gevind word nie.</p>

  const move = (direction: -1 | 1) => setActiveIndex((index) => (index + direction + availablePhrases.length) % availablePhrases.length)

  return (
    <section className={styles.page}>
      <CompactHero
        className={styles.doopHero}
        kicker={`01 · DOOP DIT · ${AREA_NAMES[activePhrase.area]}`}
        title={activePhrase.text}
        statement
        detail
        topAction={<Link to="/woordjag" className={styles.back}><span aria-hidden="true">←</span> My plakkate</Link>}
      >
        <div className={styles.heroPhraseControls}>
          <button type="button" onClick={() => move(-1)} aria-label="Vorige frase">‹</button>
          <div>
            <small>FRASE {activeIndex + 1} VAN {availablePhrases.length}</small>
            <strong>{fromScan ? 'PLAKKAAT GESKANDEER · ' : ''}{AREA_NAMES[activePhrase.area]}</strong>
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
      await addWord({ text: newWord, phraseId: phrase.id, phraseText: phrase.text, area: phrase.area, user, profile })
      await completeChallenge(user.uid, 'doop', true)
      setNewWord('')
      setMessage(fromScan ? 'Mooi! Jou woord is geplaas en die plakkaat is versamel.' : 'Mooi! Jou nuwe woord is geplaas.')
      setCompleted(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ons kon nie jou woord plaas nie.')
    } finally { setSubmitting(false) }
  }

  return (
    <article className={styles.challenge}>
      {completed && <ChallengeSuccess challengeId="doop" icon="✏️" title="Jou woord is gebore!" text="Jy het ’n splinternuwe woord vir die frase geskep. Jou Doop Dit-plakkaat is gereed." />}
      <div className={styles.creator}>
        <label htmlFor="doop-word">Doop dit met jou eie woord</label>
        <div><input ref={inputRef} id="doop-word" value={newWord} maxLength={40} placeholder="Tik jou nuwe woord…" onChange={(event) => setNewWord(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void submit()} /><button type="button" disabled={submitting || newWord.trim().length < 2} onClick={() => void submit()}>{submitting ? 'Plaas…' : 'Plaas my woord →'}</button></div>
        <small>Geplaas as {profile.username}</small>
        {message && <p role="status">{message}</p>}
      </div>

      <section className={styles.words}>
        <div className={styles.wordsHeading}><div><small>WOORDE VIR HIERDIE FRASE</small><h2>Wat ander mense dit noem</h2></div><strong>{displayWords.length}</strong></div>
        {loading && !displayWords.length ? <p className={styles.empty}>Woorde groei…</p> : <ul>{displayWords.sort((a, b) => b.likes - a.likes).map((word, index) => <li key={word.id}><span className={styles.rank}>{index === 0 ? '★' : `#${index + 1}`}</span><img src={word.avatar} alt="" /><div><strong>{word.text}</strong><small>{word.username}</small></div><b>♥ {word.likes}</b></li>)}</ul>}
      </section>
    </article>
  )
}
