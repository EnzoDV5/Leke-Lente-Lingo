import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import Section from '../../../components/ui/Section'
import DataSkeleton from '../../../components/ui/DataSkeleton'
import {
  fallbackProfileAvatar,
  resolveProfileAvatar,
} from '../../../lib/profileAvatars'
import { mockRankedWords } from '../../../lib/mockData'
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

const FALLBACK_WORDS: LeaderboardWord[] = mockRankedWords.map(({ phrase, word }) => ({
  id: word.id,
  phraseId: phrase.id,
  phraseText: phrase.beskrywing,
  area: phrase.area,
  text: word.woord,
  createdByUid: '',
  createdByUsername: word.handle,
  createdByAvatar: '',
  upVotes: word.stemme,
  downVotes: 0,
  score: word.stemme,
  totalVotes: word.stemme,
}))

const FALLBACK_TOP = FALLBACK_WORDS.slice(0, 3)

function fallbackWithDownVotes(id: string, downVotes: number) {
  const word = FALLBACK_WORDS.find((candidate) => candidate.id === id)
  if (!word) return null

  return {
    ...word,
    downVotes,
    score: word.upVotes - downVotes,
    totalVotes: word.upVotes + downVotes,
  }
}

const FALLBACK_WORST = [
  fallbackWithDownVotes('kaart-remix-3', 180),
  fallbackWithDownVotes('twee-remix-3', 145),
  fallbackWithDownVotes('rook-remix-3', 125),
].filter((word): word is LeaderboardWord => Boolean(word))

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
  const fallbackWords = mode === 'top' ? FALLBACK_TOP : FALLBACK_WORST
  const hasCompleteLivePodium = liveWords.length >= 3
  const words = hasCompleteLivePodium ? liveWords.slice(0, 3) : fallbackWords
  const usingFallback = !hasCompleteLivePodium
  const voteValue = (word: LeaderboardWord) =>
    mode === 'top' ? word.upVotes : word.downVotes
  const displayedTotalWords = totalWords || mockRankedWords.length
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

      {loading ? (
        <DataSkeleton variant="podium" label="Die woordpodium word gebou" />
      ) : (
          <div className={`${styles.podium} ${mode === 'worst' ? styles.worst : ''} ${switching ? styles.switching : ''}`}>
            {podium.map(({ rank, word }) => {
              if (!word) return null
              const votes = voteValue(word)
              const heights = podiumHeight(word)
              const winnerWordLength = word.text.trim().length
              const winnerWordSize = rank !== 1
                ? ''
                : winnerWordLength > 22
                  ? styles.winnerWordLong
                  : winnerWordLength > 13
                    ? styles.winnerWordMedium
                    : styles.winnerWordShort
              const winnerMobileFontSize = Math.max(
                .52,
                Math.min(1.05, 1.28 - winnerWordLength * .04),
              )

              return (
                <Link
                  className={`${styles.column} ${styles[`columnRank${rank}`]}`}
                  key={`${mode}-${rank}-${word.id}`}
                  to={`/woordeboek/${word.phraseId}?word=${word.id}`}
                  viewTransition
                  style={{ '--entrance-delay': `${220 + rank * 105}ms` } as CSSProperties}
                  aria-label={`Nommer ${rank}: ${word.text} deur ${word.createdByUsername}, ${votes} ${mode === 'top' ? 'stemme' : 'afstemme'}`}
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
                    <span className={`${styles.podiumContent} ${rank === 1 ? styles.winnerContent : ''}`}>
                      <span
                        className={`${styles.word} ${winnerWordSize}`}
                        style={rank === 1
                          ? { '--winner-mobile-font-size': `${winnerMobileFontSize}rem` } as CSSProperties
                          : undefined}
                      >
                        {word.text}
                      </span>
                      <span className={styles.votes}>
                        <span className={styles.voteIcon} aria-hidden="true">
                          {mode === 'top' ? '👍' : '👎'}
                        </span>
                        <span className={styles.voteCopy}>
                          <strong><AnimatedNumber value={votes} active={entered} /></strong>
                        </span>
                      </span>
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
