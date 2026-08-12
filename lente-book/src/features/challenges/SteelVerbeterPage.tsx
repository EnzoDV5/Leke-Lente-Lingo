import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import { useLivePhrases, type LivePhrase } from '../../hooks/useLivePhrases'
import { useLiveWords, type LiveWord } from '../../hooks/useLiveWords'
import { frases } from '../../lib/mockData'
import { addWord } from '../../lib/wordService'
import { completeChallenge } from '../../lib/challengeProgress'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import { useAuth } from '../auth/AuthContext'
import type { FestivalArea } from '../../types'
import styles from './SteelVerbeterPage.module.css'
import ChallengeSuccess from './ChallengeSuccess'

type DisplayPhrase = Pick<LivePhrase, 'id' | 'text' | 'area' | 'boardNumber'>
type RemixChoice = { id: string; text: string; username: string; avatar: string; likes: number; downVotes: number; rootWordId: string | null; isRemix: boolean; parentWordText: string | null }

const AREA_NAMES: Record<FestivalArea, string> = {
  bathroom: 'Die Poep-Pods', smoking: 'Die Choef-hoek', bar: 'Die Dopstop', stages: 'Die Beats Blok',
}

export default function SteelVerbeterPage() {
  const { phraseId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const { phrases: livePhrases, loading } = useLivePhrases()
  const scannedArea = searchParams.get('area') as FestivalArea | null
  const fromScan = searchParams.get('scan') === '1'

  const availablePhrases = useMemo<DisplayPhrase[]>(() => {
    const fallback = frases.map((phrase, index) => ({ id: phrase.id, text: phrase.beskrywing, area: phrase.area, boardNumber: index + 1 }))
    const all = livePhrases.length ? livePhrases : fallback
    const area = scannedArea || all.find((phrase) => phrase.id === phraseId)?.area
    return area ? all.filter((phrase) => phrase.area === area) : all
  }, [livePhrases, phraseId, scannedArea])
  const initialIndex = Math.max(0, availablePhrases.findIndex((phrase) => phrase.id === phraseId))
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const activePhrase = availablePhrases[activeIndex] ?? availablePhrases[0]
  useEffect(() => setActiveIndex(initialIndex), [initialIndex])

  if (loading && !availablePhrases.length) return <p className={styles.loading}>Frases word gelaai…</p>
  if (!activePhrase) return <p className={styles.loading}>Hierdie poster se frases kon nie gevind word nie.</p>
  const move = (direction: -1 | 1) => setActiveIndex((index) => (index + direction + availablePhrases.length) % availablePhrases.length)

  return (
    <section className={styles.page}>
      <CompactHero className={styles.remixHero} kicker={`02 · STEEL & VERBETER · ${AREA_NAMES[activePhrase.area]}`} title={activePhrase.text} statement detail topAction={<Link to="/woordjag" className={styles.back}><span aria-hidden="true">←</span> My posters</Link>}>
        <div className={styles.heroControls}>
          <button type="button" onClick={() => move(-1)} aria-label="Vorige frase">‹</button>
          <div><small>FRASE {activeIndex + 1} VAN {availablePhrases.length}</small><strong>{fromScan ? 'POSTER GESKANDEER · ' : ''}{AREA_NAMES[activePhrase.area]}</strong><span>{availablePhrases.map((phrase, index) => <button key={phrase.id} type="button" className={index === activeIndex ? styles.activeDot : ''} onClick={() => setActiveIndex(index)} aria-label={`Wys frase ${index + 1}`} />)}</span></div>
          <button type="button" onClick={() => move(1)} aria-label="Volgende frase">›</button>
        </div>
      </CompactHero>
      <div className={styles.wrap}><RemixChallenge key={activePhrase.id} phrase={activePhrase} fromScan={fromScan} user={user!} profile={profile!} /></div>
    </section>
  )
}

function RemixChallenge({ phrase, fromScan, user, profile }: { phrase: DisplayPhrase; fromScan: boolean; user: NonNullable<ReturnType<typeof useAuth>['user']>; profile: NonNullable<ReturnType<typeof useAuth>['profile']> }) {
  const { words, loading } = useLiveWords(phrase.id, user.uid)
  const mockPhrase = frases.find((item) => item.id === phrase.id)
  const choices: RemixChoice[] = words.length
    ? words.map((word: LiveWord) => ({ id: word.id, text: word.text, username: word.createdByUsername, avatar: resolveProfileAvatar(word.createdByAvatar) ?? fallbackProfileAvatar(word.createdByUid), likes: word.upVotes, downVotes: word.downVotes, rootWordId: word.rootWordId, isRemix: word.isRemix, parentWordText: word.parentWordText }))
    : (mockPhrase?.woorde ?? []).map((word) => ({ id: word.id, text: word.woord, username: word.handle, avatar: fallbackProfileAvatar(word.handle), likes: word.stemme, downVotes: 0, rootWordId: null, isRemix: Boolean(word.verbeterVan), parentWordText: word.verbeterVan ?? null }))
  const [selected, setSelected] = useState<RemixChoice | null>(null)
  const [remix, setRemix] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const choose = (word: RemixChoice) => {
    setSelected(word); setRemix(word.text); setMessage('')
    window.setTimeout(() => { inputRef.current?.focus(); inputRef.current?.setSelectionRange(word.text.length, word.text.length) }, 80)
  }
  const submit = async () => {
    if (!selected) { setMessage('Kies eers iemand se woord om te steel.'); return }
    if (remix.trim().toLocaleLowerCase('af-ZA') === selected.text.trim().toLocaleLowerCase('af-ZA')) { setMessage('Voeg iets by die oorspronklike woord om dit te verbeter.'); return }
    setSubmitting(true); setMessage('')
    try {
      await addWord({ text: remix, phraseId: phrase.id, phraseText: phrase.text, area: phrase.area, user, profile, parentWord: { id: selected.id, text: selected.text, rootWordId: selected.rootWordId } })
      await completeChallenge(user.uid, 'remix', true)
      setSelected(null); setRemix('')
      setMessage(fromScan ? 'Skerp! Jou verbetering is geplaas en die poster is versamel.' : 'Skerp! Jou verbetering is geplaas.')
      setCompleted(true)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Ons kon nie jou verbetering plaas nie.') }
    finally { setSubmitting(false) }
  }

  return (
    <article className={styles.challenge}>
      {completed && <ChallengeSuccess challengeId="remix" icon="⇄" title="Skerp verbeter!" text="Jy het iemand se woord gesteel en jou eie slim draai daaraan gegee." />}
      <section className={styles.pickSection}>
        <header><div><small>STAP 1 · STEEL</small><h2>Kies ’n woord om te verbeter</h2></div><strong>{choices.length}</strong></header>
        {loading && !choices.length ? <p className={styles.empty}>Woorde groei…</p> : <ul>{[...choices].sort((a, b) => b.likes - a.likes).map((word, index) => <li key={word.id} className={selected?.id === word.id ? styles.selectedWord : ''}><div className={styles.wordCard}><span className={styles.rank}>{index === 0 ? '♛' : `#${index + 1}`}</span><img src={word.avatar} alt="" /><div className={styles.wordInfo}><strong>{word.text}</strong><small>{word.username}</small>{word.isRemix && word.parentWordText && <em>Gesteel en verbeter van “{word.parentWordText}”</em>}</div><button type="button" className={styles.stealButton} onClick={() => choose(word)} aria-label={`Steel en verbeter ${word.text}`}>{selected?.id === word.id ? '✓' : '⇄'}</button><div className={styles.score} aria-label={`${word.likes} opstemme en ${word.downVotes} afstemme`}><span>👍 <b>{word.likes}</b></span><span>👎 <b>{word.downVotes}</b></span></div></div></li>)}</ul>}
      </section>

      <section className={`${styles.editor} ${selected ? styles.editorReady : ''}`}>
        <small>STAP 2 · VERBETER</small>
        <h2>{selected ? `Maak “${selected.text}” beter` : 'Kies ’n woord hier bo'}</h2>
        <p>Die oorspronklike bly vas. Voeg jou eie draai aan die einde by.</p>
        <div><input ref={inputRef} disabled={!selected} value={remix} maxLength={40} placeholder="Jou verbetering…" onChange={(event) => { if (!selected) return; const next = event.target.value; if (next.startsWith(selected.text)) setRemix(next) }} onKeyDown={(event) => event.key === 'Enter' && void submit()} /><button type="button" disabled={!selected || submitting || remix === selected.text} onClick={() => void submit()}>{submitting ? 'Plaas…' : 'Plaas verbetering'}</button></div>
        <span>Geplaas as {profile.username}</span>
        {message && <p className={styles.message} role="status">{message}</p>}
      </section>
    </article>
  )
}
