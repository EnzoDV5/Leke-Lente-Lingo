import { useEffect, useState } from 'react'
import Section from '../../../components/ui/Section'
import Reveal from '../../../components/ui/Reveal'
import { useLeaderboard, type LeaderboardWord } from '../../../hooks/useLeaderboard'
import styles from './Leaderboard.module.css'

type Mode = 'top' | 'worst'

const MIN_H = 80
const MAX_H = 220

// Wys 'n lewendige podium selfs voor Firestore woorde het — verdwyn sodra regte data inkom.
const FALLBACK_TOP: LeaderboardWord[] = [
  { id: 'f1', text: 'Pronkdans', createdByUid: '', createdByUsername: '@miela_lig',      createdByAvatar: '🕺', upVotes: 623, downVotes: 12, score: 611, totalVotes: 635 },
  { id: 'f2', text: 'Nananing',  createdByUid: '', createdByUsername: '@tika_mooi',      createdByAvatar: '🎤', upVotes: 567, downVotes: 20, score: 547, totalVotes: 587 },
  { id: 'f3', text: 'Kyksog',    createdByUid: '', createdByUsername: '@dansvloer_daan', createdByAvatar: '👀', upVotes: 445, downVotes: 30, score: 415, totalVotes: 475 },
]
const FALLBACK_WORST: LeaderboardWord[] = [
  { id: 'w1', text: 'Blaaskans',  createdByUid: '', createdByUsername: '@fees_flits', createdByAvatar: '😬', upVotes: 4,  downVotes: 120, score: -116, totalVotes: 124 },
  { id: 'w2', text: 'Toustront',  createdByUid: '', createdByUsername: '@rine_nag',   createdByAvatar: '🫠', upVotes: 8,  downVotes: 90,  score: -82,  totalVotes: 98 },
  { id: 'w3', text: 'Vreemdwarm', createdByUid: '', createdByUsername: '@jaco_groot', createdByAvatar: '🥴', upVotes: 12, downVotes: 70,  score: -58,  totalVotes: 82 },
]

const isImage = (v: string) => v.startsWith('http://') || v.startsWith('https://')

function Avatar({ word }: { word: LeaderboardWord }) {
  if (isImage(word.createdByAvatar))
    return <img src={word.createdByAvatar} alt={word.createdByUsername} className={styles.avatarImg} />
  return <span className={styles.avatarEmoji}>{word.createdByAvatar || '🌼'}</span>
}

export default function Leaderboard() {
  const [mode, setMode] = useState<Mode>('top')
  const [animate, setAnimate] = useState(false)
  const { topWords, worstWords, totalVotes, loading, error } = useLeaderboard()

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const live = mode === 'top' ? topWords : worstWords
  const data = live.length ? live : (mode === 'top' ? FALLBACK_TOP : FALLBACK_WORST)
  const usingFallback = live.length === 0

  const maxMag = Math.max(1, ...data.map((w) => Math.abs(w.score)))
  const hoogte = (w: LeaderboardWord) => MIN_H + (Math.abs(w.score) / maxMag) * (MAX_H - MIN_H)

  const podium = [
    { rank: 2, word: data[1] },
    { rank: 1, word: data[0] },
    { rank: 3, word: data[2] },
  ]

  return (
    <Section bg="ink" rondBo rondOnder wydte="wyd">
      <header className={styles.kop}>
        <div>
          <p className={styles.kicker}>★ Regstreeks ★</p>
          <h2 className={styles.titel}>Die Woord-Podium</h2>
        </div>
        <div className={styles.live}>
          <span className={styles.dot} />
          <strong>{(usingFallback ? 1697 : totalVotes).toLocaleString('af-ZA')}</strong>
          <span>stemme</span>
        </div>
      </header>

      <div className={styles.toggle}>
        <button className={mode === 'top' ? styles.aktief : ''} onClick={() => setMode('top')}>🏆 Top woorde</button>
        <button className={mode === 'worst' ? styles.aktief : ''} onClick={() => setMode('worst')}>🫠 Swakste</button>
      </div>

      {loading && !usingFallback ? (
        <p className={styles.boodskap}>Die podium word gebou…</p>
      ) : (
        <Reveal>
          <div className={styles.podium}>
            {podium.map(({ rank, word }) => (
              <div key={rank} className={styles.kolom}>
                {word ? (
                  <div className={styles.kaart}>
                    <div className={styles.medalje}>{rank === 1 ? '👑' : `#${rank}`}</div>
                    <div className={styles.avatar}><Avatar word={word} /></div>
                    <h3 className={styles.woord}>{word.text}</h3>
                    <p className={styles.naam}>{word.createdByUsername}</p>
                    <div className={styles.telling}><span>👍 {word.upVotes}</span><span>👎 {word.downVotes}</span></div>
                    <strong className={styles.telkaart}>{word.score > 0 ? '+' : ''}{word.score}</strong>
                  </div>
                ) : (
                  <div className={`${styles.kaart} ${styles.leeg}`}>Wag vir ’n woord…</div>
                )}
                <div className={`${styles.staaf} ${styles[`rang${rank}`]}`}
                     style={{ height: animate ? (word ? hoogte(word) : MIN_H) : 0 }}>
                  <span className={styles.basisNommer}>{rank}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {error && !usingFallback && <p className={styles.fout}>{error}</p>}

      <p className={styles.verduidelik}>
        Die stawe rys en sak lewendig soos stemme inkom — die langste staaf lei, maar niks raak te lank nie.
      </p>
    </Section>
  )
}