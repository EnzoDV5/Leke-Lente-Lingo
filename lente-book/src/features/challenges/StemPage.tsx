import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import CompactHero from '../../components/ui/CompactHero'
import DataSkeleton from '../../components/ui/DataSkeleton'
import { useLeaderboard, type LeaderboardWord } from '../../hooks/useLeaderboard'
import { useScannedPosterClaim } from '../../hooks/useScannedPosterClaim'
import { completeChallenge } from '../../lib/challengeProgress'
import { officialPhraseText } from '../../lib/officialPhraseCopy'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import { setWordVote } from '../../lib/wordService'
import type { VoteValue } from '../../types'
import { useAuth } from '../auth/AuthContext'
import ChallengeSuccess from './ChallengeSuccess'
import styles from './StemPage.module.css'

type StemCandidate = LeaderboardWord & {
  isDemo?: boolean
}

const DEMO_WORDS: StemCandidate[] = [
  {
    id: 'stem-demo-boudbewys', text: 'Boudbewys', phraseId: 'poep-pods-warm-seat',
    phraseText: officialPhraseText('poep-pods-warm-seat'), area: 'bathroom',
    createdByUid: 'demo-lea', createdByUsername: '@lea_lente', createdByAvatar: 'profile-3',
    upVotes: 18, downVotes: 2, score: 16, totalVotes: 20, currentUserVote: null, isDemo: true,
  },
  {
    id: 'stem-demo-trekparasiet', text: 'Trekparasiet', phraseId: 'choef-hoek-pull',
    phraseText: officialPhraseText('choef-hoek-pull'), area: 'smoking',
    createdByUid: 'demo-dani', createdByUsername: '@dani_dans', createdByAvatar: 'profile-7',
    upVotes: 15, downVotes: 3, score: 12, totalVotes: 18, currentUserVote: null, isDemo: true,
  },
  {
    id: 'stem-demo-tikgeloof', text: 'Tikgeloof', phraseId: 'dopstop-bankkaart',
    phraseText: officialPhraseText('dopstop-bankkaart'), area: 'bar',
    createdByUid: 'demo-miela', createdByUsername: '@miela_lig', createdByAvatar: 'profile-11',
    upVotes: 13, downVotes: 1, score: 12, totalVotes: 14, currentUserVote: null, isDemo: true,
  },
  {
    id: 'stem-demo-uitsigvreter', text: 'Uitsigvreter', phraseId: 'beats-blok-skouers',
    phraseText: officialPhraseText('beats-blok-skouers'), area: 'stages',
    createdByUid: 'demo-fees', createdByUsername: '@fees_flits', createdByAvatar: 'profile-15',
    upVotes: 11, downVotes: 4, score: 7, totalVotes: 15, currentUserVote: null, isDemo: true,
  },
  {
    id: 'stem-demo-betaalspook', text: 'Betaalspook', phraseId: 'dopstop-verdwyn',
    phraseText: officialPhraseText('dopstop-verdwyn'), area: 'bar',
    createdByUid: 'demo-daan', createdByUsername: '@dansvloer_daan', createdByAvatar: 'profile-18',
    upVotes: 9, downVotes: 2, score: 7, totalVotes: 11, currentUserVote: null, isDemo: true,
  },
  {
    id: 'stem-demo-dopklapper', text: 'Dopklapper', phraseId: 'beats-blok-drinks',
    phraseText: officialPhraseText('beats-blok-drinks'), area: 'stages',
    createdByUid: 'demo-lig', createdByUsername: '@miela_lig', createdByAvatar: 'profile-5',
    upVotes: 8, downVotes: 3, score: 5, totalVotes: 11, currentUserVote: null, isDemo: true,
  },
  {
    id: 'stem-demo-vlamvergeet', text: 'Vlamvergeet', phraseId: 'choef-hoek-lighter',
    phraseText: officialPhraseText('choef-hoek-lighter'), area: 'smoking',
    createdByUid: 'demo-theo', createdByUsername: '@theo_tune', createdByAvatar: 'profile-9',
    upVotes: 7, downVotes: 1, score: 6, totalVotes: 8, currentUserVote: null, isDemo: true,
  },
  {
    id: 'stem-demo-skermfees', text: 'Skermfees', phraseId: 'beats-blok-screens',
    phraseText: officialPhraseText('beats-blok-screens'), area: 'stages',
    createdByUid: 'demo-ava', createdByUsername: '@ava_aan', createdByAvatar: 'profile-13',
    upVotes: 6, downVotes: 2, score: 4, totalVotes: 8, currentUserVote: null, isDemo: true,
  },
]

const WORDS_PER_ROUND = 5

function shuffledCandidates(candidates: StemCandidate[], seed: number) {
  const shuffled = [...candidates]
  let state = seed >>> 0

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

export default function StemPage() {
  const [searchParams] = useSearchParams()
  const fromScan = searchParams.get('scan') === '1'
  const { user, profile } = useAuth()
  const { words, loading, error } = useLeaderboard()
  const { claimed } = useScannedPosterClaim(user?.uid, 'vote', fromScan)
  const [completed, setCompleted] = useState(false)
  const [busyWordId, setBusyWordId] = useState('')
  const [message, setMessage] = useState('')
  const [demoVotes, setDemoVotes] = useState<Record<string, VoteValue | null>>({})
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now())

  const feed = useMemo(
    () => {
      const realWords: StemCandidate[] = [...words]
        .sort((first, second) => {
          if (second.totalVotes !== first.totalVotes) return second.totalVotes - first.totalVotes
          return first.text.localeCompare(second.text, 'af')
        })
        .map((word) => ({
          ...word,
          phraseText: word.phraseText?.trim() || 'Die oorspronklike frase vir hierdie feeswoord word nog gelaai.',
        }))

      const examples = DEMO_WORDS.map((word) => {
        const currentUserVote = demoVotes[word.id] ?? null
        return {
          ...word,
          currentUserVote,
          upVotes: word.upVotes + (currentUserVote === 1 ? 1 : 0),
          downVotes: word.downVotes + (currentUserVote === -1 ? 1 : 0),
          totalVotes: word.totalVotes + (currentUserVote ? 1 : 0),
        }
      })

      return [...realWords, ...examples]
    },
    [demoVotes, words],
  )

  const visibleFeed = useMemo(
    () => shuffledCandidates(feed, shuffleSeed).slice(0, WORDS_PER_ROUND),
    [feed, shuffleSeed],
  )

  const vote = async (word: StemCandidate, value: VoteValue) => {
    if (!user || !profile || busyWordId) return
    setBusyWordId(word.id)
    setMessage('')
    try {
      const currentVote = word.currentUserVote ?? null

      if (word.isDemo) {
        setDemoVotes((current) => ({
          ...current,
          [word.id]: currentVote === value ? null : value,
        }))
      } else {
        await setWordVote({
          wordId: word.id,
          phraseId: word.phraseId,
          user,
          username: profile.username,
          value,
          currentVote,
        })
      }

      if (currentVote !== value) {
        await completeChallenge(user.uid, 'vote', fromScan, {
          kind: 'vote',
          word: word.text,
          phrase: word.phraseText ?? '',
          area: word.area ?? '',
          itemId: word.id,
          voteValue: value,
        })
        setCompleted(fromScan)
        setMessage(word.isDemo
          ? 'Jou stem is gekies!'
          : value === 1 ? 'Jou stem tel!' : 'Jou afstem tel!')
      } else {
        setMessage('Jou stem of afstem is verwyder.')
      }
    } catch (voteError) {
      console.error('Stem challenge vote failed:', voteError)
      setMessage('Ons kon nie jou stem stoor nie. Probeer weer.')
    } finally {
      setBusyWordId('')
    }
  }

  return (
    <section className={styles.page}>
      {claimed && <ChallengeSuccess challengeId="vote" icon="👍" unlockOnly title="Stem ontsluit!" text="Jy het reeds ’n stem gegee, so die QR-kode het jou Stem-poster onmiddellik ontsluit." />}
      {completed && <ChallengeSuccess challengeId="vote" icon="👍" title="Jou stem tel!" text="Jy het ’n Lente Book-woord ’n stem of afstem gegee en die Stem-poster verdien." />}

      <CompactHero
        className={styles.hero}
        kicker="06 · STEM"
        title="Laat jou stem tel."
        subtitle="Rol deur die woorde en gee jou gunsteling ’n stem, of stuur een met ’n afstem terug tekenbord toe."
        topAction={<Link to="/collections" className={styles.back}><span aria-hidden="true">←</span> My posters</Link>}
      />

      <div className={styles.wrap}>
        <header className={styles.feedHeading}>
          <div><small>REGSTREEKSE WOORDELYS</small><h1>Kies ’n woord</h1><p>Nie jou smaak nie? Kry ’n nuwe klomp woorde.</p></div>
          <div className={styles.feedTools}>
            <strong aria-label={loading ? 'Woorde word gelaai' : `${feed.length} woorde beskikbaar`}>{loading ? '…' : feed.length}</strong>
            <button type="button" onClick={() => setShuffleSeed((current) => current + 1)} aria-label="Wys ander woorde" title="Wys ander woorde">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5M6.1 9a7 7 0 0 1 11.4-2.4L20 9M4 15l2.5 2.4A7 7 0 0 0 17.9 15" /></svg>
            </button>
          </div>
        </header>

        {message && <p className={styles.message} role="status">{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <DataSkeleton count={5} label="Woorde om voor te stem word gelaai" />
        ) : !feed.length ? (
          <p className={styles.empty}>Daar is nog nie woorde om voor te stem nie.</p>
        ) : (
          <ol className={styles.feed} aria-label="Woorde om voor te stem">
            {visibleFeed.map((word, index) => {
              const avatar = resolveProfileAvatar(word.createdByAvatar) ?? fallbackProfileAvatar(word.createdByUid)
              return (
                <li key={word.id} className={styles.wordCard}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <img src={avatar} alt="" />
                  <div className={styles.wordCopy}>
                    <strong>{word.text}</strong>
                    <small>{word.createdByUsername}</small>
                    <div className={styles.phrase}><span>DIE FRASE</span><p>{word.phraseText}</p></div>
                  </div>
                  <div className={styles.voteControls}>
                    <button type="button" className={word.currentUserVote === 1 ? styles.selectedUp : ''} disabled={busyWordId === word.id} onClick={() => void vote(word, 1)} aria-label={`Gee ${word.text} ’n stem`}>
                      <span aria-hidden="true">👍</span><b>{word.upVotes}</b>
                    </button>
                    <button type="button" className={word.currentUserVote === -1 ? styles.selectedDown : ''} disabled={busyWordId === word.id} onClick={() => void vote(word, -1)} aria-label={`Gee ${word.text} ’n afstem`}>
                      <span aria-hidden="true">👎</span><b>{word.downVotes}</b>
                    </button>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}
