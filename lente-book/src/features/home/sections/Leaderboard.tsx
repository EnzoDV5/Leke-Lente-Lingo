import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import Section from '../../../components/ui/Section'
import {
  fallbackProfileAvatar,
  profileAvatar,
  resolveProfileAvatar,
} from '../../../lib/profileAvatars'
import {
  useLeaderboard,
  type LeaderboardWord,
} from '../../../hooks/useLeaderboard'
import sparkPinkFilled from '../../../assets/elements/poster elements/sparkPink filled.webp'
import winnerCup from '../../../assets/elements/poster elements/winner cup.webp'
import styles from './Leaderboard.module.css'

type Mode = 'top' | 'worst'

type WordTotalVars = CSSProperties & {
  '--word-total-spark': string
}

const FALLBACK_TOP: LeaderboardWord[] = [
  { id: 'skouer-1', phraseId: 'beats-blok-skouers', text: 'Uitsigvreter', createdByUid: '', createdByUsername: '@fees_flits', createdByAvatar: profileAvatar(2), upVotes: 745, downVotes: 12, score: 733, totalVotes: 757 },
  { id: 'kaart-1', phraseId: 'dopstop-bankkaart', text: 'Tikgeloof', createdByUid: '', createdByUsername: '@miela_lig', createdByAvatar: profileAvatar(3), upVotes: 703, downVotes: 20, score: 683, totalVotes: 723 },
  { id: 'dans-1', phraseId: 'beats-blok-drinks', text: 'Dopklapper', createdByUid: '', createdByUsername: '@dansvloer_daan', createdByAvatar: profileAvatar(4), upVotes: 682, downVotes: 30, score: 652, totalVotes: 712 },
]

const FALLBACK_WORST: LeaderboardWord[] = [
  { id: 'kaart-remix-3', phraseId: 'dopstop-bankkaart', text: 'Kaartgebed-kabaal', createdByUid: '', createdByUsername: '@fees_fabriek', createdByAvatar: profileAvatar(4), upVotes: 4, downVotes: 120, score: -116, totalVotes: 124 },
  { id: 'twee-remix-3', phraseId: 'poep-pods-twee', text: 'Poep-pasmaat-kabaal', createdByUid: '', createdByUsername: '@fees_fabriek', createdByAvatar: profileAvatar(5), upVotes: 8, downVotes: 90, score: -82, totalVotes: 98 },
  { id: 'rook-remix-3', phraseId: 'choef-hoek-crowded', text: 'Pofpodium-kabaal', createdByUid: '', createdByUsername: '@fees_fabriek', createdByAvatar: profileAvatar(6), upVotes: 12, downVotes: 70, score: -58, totalVotes: 82 },
]

function isImage(value: string) {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.startsWith('data:')
  )
}

function Avatar({ word }: { word: LeaderboardWord }) {
  const profileImage =
    resolveProfileAvatar(word.createdByAvatar) ??
    fallbackProfileAvatar(word.createdByUid || word.createdByUsername)

  if (profileImage || isImage(word.createdByAvatar)) {
    return (
      <img
        src={profileImage ?? word.createdByAvatar}
        alt=""
        className={styles.avatarImg}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <span className={styles.avatarEmoji} aria-hidden="true">
      {word.createdByAvatar || '🌼'}
    </span>
  )
}

function AnimatedNumber({ value, active = true }: { value: number; active?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setDisplayValue(0)
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value)
      return
    }

    const startedAt = performance.now()
    const duration = 1100
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, value])

  return <>{displayValue.toLocaleString('af-ZA')}</>
}

export default function Leaderboard() {
  const [mode, setMode] = useState<Mode>('top')
  const [selectedMode, setSelectedMode] = useState<Mode>('top')
  const [animate, setAnimate] = useState(false)
  const [entered, setEntered] = useState(false)
  const [entranceAnimating, setEntranceAnimating] = useState(false)
  const [switching, setSwitching] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const switchTimer = useRef(0)
  const {
    topWords,
    worstWords,
    totalWords,
    loading,
    error,
  } = useLeaderboard()

  useEffect(() => {
    setAnimate(false)
    if (!entered) return
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [entered, mode])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setEntered(true)
        setEntranceAnimating(true)
        window.setTimeout(() => setEntranceAnimating(false), 1300)
        observer.disconnect()
      },
      { threshold: 0.12, rootMargin: '-18% 0px -22% 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => window.clearTimeout(switchTimer.current), [])

  const switchMode = (nextMode: Mode) => {
    if (nextMode === selectedMode) return
    window.clearTimeout(switchTimer.current)
    setSelectedMode(nextMode)
    setSwitching(true)
    setAnimate(false)
    switchTimer.current = window.setTimeout(() => {
      setMode(nextMode)
      setSwitching(false)
    }, 680)
  }

  const liveWords = mode === 'top' ? topWords : worstWords
  const words = liveWords.length
    ? liveWords
    : mode === 'top'
      ? FALLBACK_TOP
      : FALLBACK_WORST
  const usingFallback = liveWords.length === 0
  const voteValue = (word: LeaderboardWord) =>
    mode === 'top' ? word.upVotes : word.downVotes
  const displayedTotalWords = totalWords || 1284
  const voteValues = words.map(voteValue)
  const lowestVotes = Math.min(...voteValues)
  const highestVotes = Math.max(...voteValues)
  const voteRange = Math.max(1, highestVotes - lowestVotes)
  const podiumHeight = (word: LeaderboardWord) => {
    const strength = (voteValue(word) - lowestVotes) / voteRange
    return {
      desktop: Math.round(270 + strength * 230),
      mobile: Math.round(150 + strength * 135),
    }
  }
  const podium = [
    { rank: 2, word: words[1] },
    { rank: 1, word: words[0] },
    { rank: 3, word: words[2] },
  ]

  return (
    <Section
      bg="paper"
      wydte="wyd"
      sectionRef={sectionRef}
      className={`${styles.section} ${entered ? styles.entered : styles.awaitingEntrance} ${entranceAnimating ? styles.entrance : ''}`}
    >
      <header className={styles.header}>
        <div className={styles.headingBlock}>
          <p className={styles.kicker}>★ Top woord-picks ★</p>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Die Woord-Podium</h2>
            <img
              className={styles.titleCup}
              src={winnerCup}
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className={styles.toggle} aria-label="Kies ranglys">
            <button
              className={selectedMode === 'top' ? styles.active : ''}
              onClick={() => switchMode('top')}
            >
              🏆 Top woorde
            </button>
            <button
              className={selectedMode === 'worst' ? styles.active : ''}
              onClick={() => switchMode('worst')}
            >
              👎 Swakste
            </button>
          </div>
        </div>

        <div
          className={styles.wordTotal}
          aria-label={`${displayedTotalWords} woorde bygevoeg`}
          style={{
            '--word-total-spark': `url(${sparkPinkFilled})`,
          } as WordTotalVars}
        >
          <strong><AnimatedNumber value={displayedTotalWords} active={entered} /></strong>
          <span>Woorde gebore</span>
        </div>
      </header>

      {loading && !usingFallback ? (
        <p className={styles.message}>Die podium word gebou…</p>
      ) : (
          <div className={`${styles.podium} ${mode === 'worst' ? styles.worst : ''} ${switching ? styles.switching : ''}`}>
            {podium.map(({ rank, word }) => {
              if (!word) return null
              const votes = voteValue(word)
              const heights = podiumHeight(word)

              return (
                <Link
                  className={styles.column}
                  key={`${mode}-${rank}-${word.id}`}
                  to={`/woordeboek/${word.phraseId}?word=${word.id}`}
                  viewTransition
                  style={{ '--entrance-delay': `${220 + rank * 105}ms` } as CSSProperties}
                  aria-label={`Nommer ${rank}: ${word.text} deur ${word.createdByUsername}, ${votes} ${mode === 'top' ? 'opstemme' : 'afstemme'}`}
                >
                  <div className={styles.person}>
                    {rank === 1 && <span className={styles.crown} aria-hidden="true">👑</span>}
                    <span className={styles.rank}>{rank === 1 ? '1ste' : rank === 2 ? '2de' : '3de'}</span>
                    <span className={styles.avatar}><Avatar word={word} /></span>
                    <strong>{word.createdByUsername || 'Anoniem'}</strong>
                  </div>

                  <div
                    className={`${styles.podiumBlock} ${styles[`rank${rank}`]} ${animate ? styles.raised : ''}`}
                    style={{
                      '--podium-height': `${heights.desktop}px`,
                      '--podium-mobile-height': `${heights.mobile}px`,
                    } as CSSProperties}
                  >
                    <span className={styles.place}>{rank}</span>
                    <span className={styles.word}>{word.text}</span>
                    <span className={styles.votes}>
                      <span className={styles.voteIcon} aria-hidden="true">
                        {mode === 'top' ? '👍' : '👎'}
                      </span>
                      <strong><AnimatedNumber value={votes} active={entered} /></strong>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
      )}

      {error && !usingFallback && <p className={styles.error}>{error}</p>}
    </Section>
  )
}
