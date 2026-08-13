import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import DataSkeleton from '../../components/ui/DataSkeleton'
import LoadingCard from '../../components/ui/LoadingCard'
import FestivalLocationLabel from '../../components/ui/FestivalLocationLabel'
import { useLivePhrases, type LivePhrase } from '../../hooks/useLivePhrases'
import { useLiveWords, type LiveWord } from '../../hooks/useLiveWords'
import { frases } from '../../lib/mockData'
import { addWord } from '../../lib/wordService'
import { completeChallenge } from '../../lib/challengeProgress'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import { useAuth } from '../auth/AuthContext'
import type { FestivalArea } from '../../types'
import styles from './SteelEnVerbeterPage.module.css'
import ChallengeSuccess from './ChallengeSuccess'
import { useScannedPosterClaim } from '../../hooks/useScannedPosterClaim'

type DisplayPhrase = Pick<LivePhrase, 'id' | 'text' | 'area' | 'boardNumber'>
type RemixChoice = { id: string; text: string; username: string; avatar: string; likes: number; downVotes: number; rootWordId: string | null; isRemix: boolean; parentWordText: string | null }

export default function SteelEnVerbeterPage() {
  const { phraseId = '' } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const { phrases: livePhrases, loading } = useLivePhrases()
  const scannedArea = searchParams.get('area') as FestivalArea | null
  const fromScan = searchParams.get('scan') === '1' || Boolean(scannedArea)
  const { claimed } = useScannedPosterClaim(user?.uid, 'remix', fromScan)
  const claimedByScanRouter = Boolean(
    (location.state as { posterJustClaimed?: boolean } | null)
      ?.posterJustClaimed,
  )

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

  if (loading) return <div className={styles.loading}><LoadingCard label="Frases word reggesit…" /></div>
  if (!activePhrase) return <p className={styles.loading}>Hierdie poster se frases kon nie gevind word nie.</p>
  const move = (direction: -1 | 1) => setActiveIndex((index) => (index + direction + availablePhrases.length) % availablePhrases.length)

  return (
    <section className={styles.page} data-area={activePhrase.area}>
      {(claimed || claimedByScanRouter) && <ChallengeSuccess challengeId="remix" icon="⇄" unlockOnly title="Steel & Verbeter ontsluit!" text="Jy het reeds ’n woord verbeter, so hierdie QR-kode het jou poster onmiddellik ontsluit." />}
      <CompactHero className={styles.remixHero} kicker="02 · STEEL & VERBETER" title={activePhrase.text} statement detail topAction={<Link to="/collections" className={styles.back}><span aria-hidden="true">←</span> My posters</Link>}>
        <div className={styles.heroControls}>
          <button type="button" onClick={() => move(-1)} aria-label="Vorige frase">‹</button>
          <div><small>FRASE {activeIndex + 1} VAN {availablePhrases.length}</small><FestivalLocationLabel area={activePhrase.area} /><span>{availablePhrases.map((phrase, index) => <button key={phrase.id} type="button" className={index === activeIndex ? styles.activeDot : ''} onClick={() => setActiveIndex(index)} aria-label={`Wys frase ${index + 1}`} />)}</span></div>
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
  const lockedPrefix = selected?.text.slice(0, 2) ?? ''
  const remixChanged = Boolean(
    selected &&
    remix.trim().length > lockedPrefix.length &&
    remix.trim().toLocaleLowerCase('af-ZA') !== selected.text.trim().toLocaleLowerCase('af-ZA'),
  )

  const choose = (word: RemixChoice) => {
    setSelected(word); setRemix(word.text); setMessage('')
    window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(Math.min(2, word.text.length), word.text.length)
    }, 80)
  }
  const submit = async () => {
    if (!selected) { setMessage('Kies eers iemand se woord om te steel.'); return }
    if (remix.trim().length <= lockedPrefix.length) { setMessage('Hou die eerste twee letters en voeg minstens een nuwe letter by.'); return }
    if (remix.trim().toLocaleLowerCase('af-ZA') === selected.text.trim().toLocaleLowerCase('af-ZA')) { setMessage('Voeg iets by die oorspronklike woord om dit te verbeter.'); return }
    setSubmitting(true); setMessage('')
    try {
      const cleanRemix = remix.trim()
      const wordId = await addWord({ text: cleanRemix, phraseId: phrase.id, phraseText: phrase.text, area: phrase.area, user, profile, parentWord: { id: selected.id, text: selected.text, rootWordId: selected.rootWordId } })
      await completeChallenge(user.uid, 'remix', fromScan, { kind: 'remix', word: cleanRemix, originalWord: selected.text, phrase: phrase.text, area: phrase.area, itemId: wordId })
      setSelected(null); setRemix('')
      setMessage(fromScan ? 'Skerp! Jou verbetering is ingesit en die poster is versamel.' : 'Skerp! Jou verbetering is ingesit.')
      setCompleted(fromScan)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Ons kon nie jou verbetering insit nie.') }
    finally { setSubmitting(false) }
  }

  return (
    <article className={styles.challenge}>
      {completed && <ChallengeSuccess challengeId="remix" icon="⇄" title="Skerp verbeter!" text="Jy het iemand se woord gesteel en jou eie slim draai daaraan gegee." />}
      <section className={`${styles.editor} ${selected ? styles.editorReady : ''}`}>
        <small>JOU VERBETERING</small>
        <h2>{selected ? `Maak “${selected.text}” beter` : 'Kies ’n woord hier onder'}</h2>
        <p>Die eerste twee letters bly vas. Skrap of verander die res en gee dit jou eie draai.</p>
        <div><input ref={inputRef} disabled={!selected} value={remix} maxLength={40} placeholder="Jou verbetering…" onChange={(event) => { if (!selected) return; const next = event.target.value; if (next.length < lockedPrefix.length) setRemix(lockedPrefix); else if (next.startsWith(lockedPrefix)) setRemix(next) }} onKeyDown={(event) => event.key === 'Enter' && void submit()} /><button type="button" disabled={!remixChanged || submitting} onClick={() => void submit()}>{submitting ? 'Sit in…' : 'Sit verbetering in'}</button></div>
        <span>Ingesit as {profile.username}</span>
        {message && <p className={styles.message} role="status">{message}</p>}
      </section>

      <section className={styles.pickSection}>
        <header><div><small>KIES EERS ’N WOORD</small><h2>Kies ’n woord om te steel en verbeter</h2></div><strong>{choices.length}</strong></header>
        {loading ? <DataSkeleton count={4} label="Woorde om te verbeter word gelaai" /> : <ul>{[...choices].sort((a, b) => b.likes - a.likes).map((word, index) => <li key={word.id} className={selected?.id === word.id ? styles.selectedWord : ''}><div className={styles.wordCard}><span className={styles.rank}>{index === 0 ? '♛' : `#${index + 1}`}</span><img src={word.avatar} alt="" /><div className={styles.wordInfo}><strong>{word.text}</strong><small>{word.username}</small>{word.isRemix && word.parentWordText && <em>Gesteel en verbeter van “{word.parentWordText}”</em>}</div><button type="button" className={styles.stealButton} onClick={() => choose(word)} aria-label={`Steel en verbeter ${word.text}`}>{selected?.id === word.id ? '✓' : '⇄'}</button><div className={styles.score} aria-label={`${word.likes} stemme en ${word.downVotes} afstemme`}><span>👍 <b>{word.likes}</b></span><span>👎 <b>{word.downVotes}</b></span></div></div></li>)}</ul>}
      </section>
    </article>
  )
}
