import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import LoadingCard from '../../components/ui/LoadingCard'
import { useLivePhrases } from '../../hooks/useLivePhrases'
import { addWord } from '../../lib/wordService'
import { frases } from '../../lib/mockData'
import { completeFriendInvite, createFriendInvite, getFriendInvite, getLatestFriendInvite, watchFriendInvite, type FriendInvite } from '../../lib/friendInviteService'
import { useAuth } from '../auth/AuthContext'
import ChallengeSuccess from './ChallengeSuccess'
import styles from './DaagMaatPage.module.css'

export default function DaagMaatPage() {
  const { inviteId } = useParams()
  return inviteId ? <FriendResponse inviteId={inviteId} /> : <InviteCreator />
}

function InviteCreator() {
  const { user, profile } = useAuth()
  const { phrases: livePhrases } = useLivePhrases()
  const choices = useMemo(() => livePhrases.length ? livePhrases : frases.map((phrase, index) => ({ id: phrase.id, text: phrase.beskrywing, area: phrase.area, boardNumber: index + 1, colour: phrase.kleur })), [livePhrases])
  const [selectedId, setSelectedId] = useState(choices[0]?.id ?? '')
  const [invite, setInvite] = useState<FriendInvite | null>(null)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  useEffect(() => {
    if (!user) return
    void getLatestFriendInvite(user.uid).then((latest) => {
      if (!latest) return
      setInvite(latest)
      if (latest.status === 'completed') setCompleted(true)
    })
  }, [user])
  useEffect(() => { if (!selectedId && choices[0]) setSelectedId(choices[0].id) }, [choices, selectedId])
  const currentInviteId = invite?.id
  useEffect(() => currentInviteId ? watchFriendInvite(currentInviteId, (next) => { if (next) setInvite(next); if (next?.status === 'completed') setCompleted(true) }) : undefined, [currentInviteId])
  const selected = choices.find((phrase) => phrase.id === selectedId)
  const create = async () => {
    if (!user || !profile || !selected || creating) return
    setCreating(true); setMessage('')
    try { setInvite(await createFriendInvite({ inviterUid: user.uid, inviterUsername: profile.username, phraseId: selected.id, phraseText: selected.text, area: selected.area })) }
    catch { setMessage('Ons kon nie jou uitnodiging maak nie.') }
    finally { setCreating(false) }
  }
  const inviteUrl = invite ? `${window.location.origin}/challenge/maat/invite/${invite.id}` : ''
  const share = async () => {
    if (!invite) return
    try {
      if (navigator.share) await navigator.share({ title: 'Challenge ’n Chommie', text: `${profile?.username} daag jou uit om ’n nuwe Afrikaanse woord te skep!`, url: inviteUrl })
      else { await navigator.clipboard.writeText(inviteUrl); setMessage('Skakel gekopieer!') }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setMessage('Kopieer die skakel en stuur dit vir jou maat.') }
  }
  return <section className={styles.page}>{completed && <ChallengeSuccess challengeId="friend" icon="📲" title="Uitdaging voltooi!" text={`${invite?.inviteeUsername ?? 'Jou maat'} het “${invite?.wordText}” geskep. Julle het albei die poster verdien.`} />}<CompactHero className={styles.hero} kicker="05 · CHALLENGE ’N CHOMMIE" title="Bring iemand buite die fees in." statement detail topAction={<Link to="/woordjag" className={styles.back}><span aria-hidden="true">←</span> My posters</Link>}><p className={styles.heroCopy}>Kies ’n frase, stuur die unieke skakel en wag vir jou maat se nuwe woord.</p></CompactHero><div className={styles.wrap}>{!invite ? <><header><small>STAP 1 · KIES</small><h2>Watter frase stuur jy?</h2></header><div className={styles.phrases}>{choices.map((phrase, index) => <button type="button" key={phrase.id} className={selectedId === phrase.id ? styles.selected : ''} onClick={() => setSelectedId(phrase.id)}><span>0{index + 1}</span><div><small>{phrase.area}</small><strong>{phrase.text}</strong></div><i>{selectedId === phrase.id ? '✓' : 'KIES'}</i></button>)}</div><button className={styles.createButton} disabled={!selected || creating} onClick={() => void create()}>{creating ? 'Maak skakel…' : 'Maak my uitnodiging'}</button></> : <section className={styles.shareCard}><span>📲</span><small>STAP 2 · STUUR</small><h2>Jou uitdaging is gereed</h2><p>{invite.phraseText}</p><div className={styles.link}><input readOnly value={inviteUrl} /><button type="button" onClick={() => void navigator.clipboard.writeText(inviteUrl)}>Kopieer</button></div><button className={styles.shareButton} type="button" onClick={() => void share()}>Deel met my maat</button><div className={styles.waiting}><i />{invite.status === 'pending' ? 'Wag vir jou maat se woord…' : `${invite.inviteeUsername} het ${invite.wordText} geskep!`}</div></section>}{message && <p className={styles.message}>{message}</p>}</div></section>
}

function FriendResponse({ inviteId }: { inviteId: string }) {
  const { user, profile } = useAuth()
  const [invite, setInvite] = useState<FriendInvite | null>(null)
  const [loading, setLoading] = useState(true)
  const [word, setWord] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  useEffect(() => { void getFriendInvite(inviteId).then(setInvite).finally(() => setLoading(false)) }, [inviteId])
  const submit = async () => {
    if (!invite || !user || !profile || word.trim().length < 2 || submitting) return
    if (invite.inviterUid === user.uid) { setMessage('Jy kan nie jou eie uitnodiging voltooi nie—stuur dit vir ’n maat.'); return }
    if (invite.status !== 'pending' || invite.expiresAt.toMillis() < Date.now()) { setMessage('Hierdie uitnodiging is reeds gebruik of het verval.'); return }
    setSubmitting(true); setMessage('')
    try { const wordId = await addWord({ text: word, phraseId: invite.phraseId, phraseText: invite.phraseText, area: invite.area, user, profile }); await completeFriendInvite(invite, user.uid, profile.username, wordId, word.trim()); setCompleted(true) }
    catch { setMessage('Ons kon nie die uitdaging voltooi nie. Probeer weer.') }
    finally { setSubmitting(false) }
  }
  if (loading) return <div className={styles.loading}><LoadingCard label="Uitnodiging word oopgemaak…" /></div>
  if (!invite) return <p className={styles.loading}>Hierdie uitnodiging bestaan nie.</p>
  return <section className={styles.page}>{completed && <ChallengeSuccess challengeId="friend" icon="🌍" title="Jy is deel van Lente Book!" text={`“${word.trim()}” is geskep. Jy en ${invite.inviterUsername} het albei die poster verdien.`} />}<CompactHero className={styles.hero} kicker="JY IS UITGEDAAG" title={`${invite.inviterUsername} wil jou woord hoor.`} statement detail><p className={styles.heroCopy}>Jy hoef nie by die fees te wees om deel van die taalpret te wees nie.</p></CompactHero><div className={styles.wrap}><section className={styles.response}><small>DIE FRASE</small><h1>{invite.phraseText}</h1><p>Wat sou jy hierdie situasie noem? Skep ’n woord wat nog nie bestaan nie.</p><label>Jou nuwe woord</label><div><input value={word} maxLength={40} placeholder="Tik jou woord…" onChange={(event) => setWord(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void submit()} /><button type="button" disabled={word.trim().length < 2 || submitting || invite.status !== 'pending'} onClick={() => void submit()}>{submitting ? 'Plaas…' : 'Plaas my woord'}</button></div><span>Geplaas as {profile?.username}</span>{invite.status === 'completed' && <p>Hierdie uitnodiging is reeds deur {invite.inviteeUsername} voltooi.</p>}{message && <p className={styles.message}>{message}</p>}</section></div></section>
}
