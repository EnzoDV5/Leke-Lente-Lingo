import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

import { useAuth } from '../../features/auth/AuthContext'
import { db } from '../../lib/firebase'
import { PROFILE_AVATARS, resolveProfileAvatar } from '../../lib/profileAvatars'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import Skeleton from '../ui/Skeleton'
import styles from './ProfileModal.module.css'

type ProfileModalProps = { open: boolean; onClose: () => void }
type UserWord = { id: string; text: string; phraseId: string; phraseText?: string }
type Vote = { wordId: string; value: number }
type PosterProgress = { collected?: boolean }

function SavedWordsSkeleton() {
  return createPortal((
    <div className={styles.wordList} aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => {
        const delay = index * 70
        return (
          <article key={index}>
            <div>
              <Skeleton width={`${64 - (index % 2) * 12}%`} height="1rem" radius={6} delay={delay} />
              <Skeleton width={`${38 - (index % 3) * 6}%`} height=".68rem" radius={6} delay={delay + 40} style={{ marginTop: '.35rem' }} />
            </div>
            <Skeleton width={30} height={18} radius={999} delay={delay + 80} />
          </article>
        )
      })}
    </div>
  ), document.body)
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  useBodyScrollLock(open)
  const { user, profile, saveProfile, checkUsernameAvailability, authError, clearAuthError } = useAuth()
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [words, setWords] = useState<UserWord[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [posters, setPosters] = useState<PosterProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarDirection, setAvatarDirection] = useState(1)
  const [avatarAnimation, setAvatarAnimation] = useState(0)

  useEffect(() => {
    if (!open || !profile) return
    setUsername(profile.username.replace(/^@/, ''))
    setAvatar(profile.character)
    setMessage('')
    clearAuthError()
  }, [clearAuthError, open, profile])

  useEffect(() => {
    if (!open || !user) return
    setLoading(true)
    const unsubscribeWords = onSnapshot(
      query(collection(db, 'words'), where('createdByUid', '==', user.uid)),
      (snapshot) => {
        setWords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as UserWord))
        setLoading(false)
      },
      () => setLoading(false),
    )
    const unsubscribeVotes = onSnapshot(collection(db, 'votes'), (snapshot) => {
      setVotes(snapshot.docs.map((item) => item.data() as Vote))
    })
    const unsubscribePosters = onSnapshot(
      collection(db, 'users', user.uid, 'posters'),
      (snapshot) => {
        setPosters(snapshot.docs.map((item) => item.data() as PosterProgress))
      },
    )
    return () => { unsubscribeWords(); unsubscribeVotes(); unsubscribePosters() }
  }, [open, user])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open, saving])

  const likesByWord = useMemo(() => {
    const totals = new Map<string, number>()
    votes.forEach((vote) => {
      if (vote.value === 1) totals.set(vote.wordId, (totals.get(vote.wordId) ?? 0) + 1)
    })
    return totals
  }, [votes])
  const totalLikes = words.reduce((total, word) => total + (likesByWord.get(word.id) ?? 0), 0)
  const collectedPosters = posters.filter((poster) => poster.collected).length
  const wildcardPhrases = words.filter((word) => word.phraseId.toLowerCase().startsWith('wildcard'))
  const avatarOptions = PROFILE_AVATARS
  const selectedAvatarIndex = Math.max(0, avatarOptions.findIndex((item) => item.id === avatar))
  const selectedAvatar = avatarOptions[selectedAvatarIndex] ?? avatarOptions[0]

  const moveAvatar = (direction: -1 | 1) => {
    if (!avatarOptions.length) return
    const nextIndex = (selectedAvatarIndex + direction + avatarOptions.length) % avatarOptions.length
    const nextAvatar = avatarOptions[nextIndex]
    setAvatarDirection(direction)
    setAvatarAnimation((value) => value + 1)
    setAvatar(nextAvatar.id)
  }

	  if (!open || !profile) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const cleanUsername = username.trim().replace(/^@/, '')
    if (cleanUsername.length < 3) { setMessage('Gebruik minstens 3 karakters.'); return }
    setSaving(true)
    setMessage('')
    const status = await checkUsernameAvailability(cleanUsername)
    if (status === 'error') {
      setMessage('Kon nie jou gebruikersnaam nagaan nie. Probeer weer.')
      setSaving(false)
      return
    }
    if (status === 'taken') {
      setMessage('Daardie gebruikersnaam is reeds geneem.')
      setSaving(false)
      return
    }
    const saved = await saveProfile({ username: cleanUsername, character: avatar })
    setSaving(false)
    if (saved) setMessage('Jou profiel is opgedateer!')
  }

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <button type="button" className={styles.close} onClick={onClose} aria-label="Maak profiel toe">×</button>
        <header className={styles.header}>
          <p>MY VINNIGE PROFIEL</p>
          <h2 id="profile-modal-title">Hallo, {profile.username}</h2>
          <span>Werk jou voorkoms by en kyk wat jy al geskep het.</span>
        </header>

        <form onSubmit={submit} className={styles.editor}>
          <div className={styles.avatarEditor}>
            <button type="button" className={styles.avatarArrow} onClick={() => moveAvatar(-1)} aria-label="Vorige profielfoto">‹</button>
            <div className={styles.avatarPreview}>
              <div className={styles.avatarCircle}>
                <div key={`${selectedAvatar?.id}-${avatarAnimation}`} className={`${styles.avatarSlide} ${avatarDirection > 0 ? styles.avatarSlideNext : styles.avatarSlidePrevious}`}>
                  <img src={selectedAvatar?.src ?? resolveProfileAvatar(avatar) ?? ''} alt="Jou gekose avatar" referrerPolicy="no-referrer" />
                </div>
              </div>
              <small>{selectedAvatar?.name ?? 'Jou avatar'}</small>
            </div>
            <button type="button" className={styles.avatarArrow} onClick={() => moveAvatar(1)} aria-label="Volgende profielfoto">›</button>
          </div>
          <div className={styles.fields}>
            <label htmlFor="profile-modal-username">Jou gebruikersnaam</label>
            <div className={styles.usernameField}><span aria-hidden="true">@</span><input id="profile-modal-username" name="profile-modal-username" value={username} minLength={3} maxLength={22} pattern="[A-Za-z0-9_]{3,22}" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="toilet_towenaar" onChange={(e) => setUsername(e.target.value.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, ''))} /></div>
            <small className={styles.usernameHint}>Gebruik letters, syfers en underscores.</small>
          </div>
          {(message || authError) && <p className={styles.notice} role="status">{message || authError}</p>}
          <button className={styles.save} disabled={saving}>{saving ? 'Stoor tans…' : 'Stoor veranderinge'}</button>
        </form>

        <div className={styles.stats}>
          <div><strong>{words.length}</strong><span>Woorde ingesit</span></div>
          <div><strong>{totalLikes}</strong><span>Hou-van’s ontvang</span></div>
          <div><strong>{collectedPosters}</strong><span>Posters versamel</span></div>
          <div><strong>{wildcardPhrases.length}</strong><span>Wildcard-frases</span></div>
        </div>

        <section className={styles.saved}>
          <h3>Jou woorde</h3>
          {loading ? <SavedWordsSkeleton /> : words.length ? <div className={styles.wordList}>{words.map((word) => <article key={word.id}><div><strong>{word.text}</strong><span>{word.phraseText || 'Jou Lente-woord'}</span></div><b>♥ {likesByWord.get(word.id) ?? 0}</b></article>)}</div> : <p className={styles.empty}>Jy het nog nie ’n woord ingesit nie.</p>}
        </section>

        {wildcardPhrases.length > 0 && <section className={styles.phrases}><h3>Jou Wildcard-frases</h3>{wildcardPhrases.map((word) => <p key={word.id}>{word.phraseText || word.text}</p>)}</section>}
      </section>
    </div>
  )
}
