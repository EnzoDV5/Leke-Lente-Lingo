import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useLocation } from 'react-router-dom'
import styles from './OnboardingBackground.module.css'
import skyImg from '../../assets/elements/cloud-background.webp'

type OrbitVars = CSSProperties & { '--dur': string; '--delay': string; '--r': string }
type EscapeVars = CSSProperties & { '--cloud-away-x': string; '--cloud-away-y': string }

// Floating foreground clouds (delete this block if you want ONLY the photo).
const CLOUDS: { img: string; r: string; w: number; dur: string; delay: string; rev?: boolean }[] = [
  { img: 'cloud1', r: '32vmax', w: 380, dur: '46s', delay: '-4s'  },
  { img: 'cloud2', r: '42vmax', w: 300, dur: '64s', delay: '-30s', rev: true },
  { img: 'cloud3', r: '28vmax', w: 460, dur: '40s', delay: '-18s' },
  { img: 'cloud5', r: '46vmax', w: 340, dur: '72s', delay: '-12s', rev: true },
  { img: 'cloud6', r: '24vmax', w: 360, dur: '52s', delay: '-40s' },
]

const STARS = [
  { img: 'star1', style: { top: '14%', left: '10%', width: 66 } as CSSProperties, delay: '0s' },
  { img: 'star2', style: { top: '28%', right: '12%', width: 48 } as CSSProperties, delay: '1s' },
  { img: 'star1', style: { bottom: '14%', left: '18%', width: 58 } as CSSProperties, delay: '2s' },
  { img: 'star2', style: { top: '55%', right: '9%', width: 54 } as CSSProperties, delay: '.5s' },
  { img: 'star1', style: { bottom: '22%', right: '24%', width: 44 } as CSSProperties, delay: '1.5s' },
]

const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none'
}

export default function OnboardingBackground() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const cloudRefs = useRef<(HTMLImageElement | null)[]>([])
  const [cloudsAway, setCloudsAway] = useState(false)
  const [escapeVars, setEscapeVars] = useState<EscapeVars[]>(
    CLOUDS.map(() => ({ '--cloud-away-x': '0px', '--cloud-away-y': '0px' })),
  )

  useLayoutEffect(() => {
    if (!isHome) {
      setCloudsAway(false)
      return
    }

    const nextEscapeVars = cloudRefs.current.map((cloud) => {
      if (!cloud) return { '--cloud-away-x': '0px', '--cloud-away-y': '-110vh' } as EscapeVars

      const rect = cloud.getBoundingClientRect()
      const edges = [
        { distance: rect.left, x: -(rect.right + 80), y: 0 },
        { distance: window.innerWidth - rect.right, x: window.innerWidth - rect.left + 80, y: 0 },
        { distance: rect.top, x: 0, y: -(rect.bottom + 80) },
        { distance: window.innerHeight - rect.bottom, x: 0, y: window.innerHeight - rect.top + 80 },
      ]
      const nearest = edges.reduce((best, edge) => edge.distance < best.distance ? edge : best)

      return {
        '--cloud-away-x': `${nearest.x}px`,
        '--cloud-away-y': `${nearest.y}px`,
      } as EscapeVars
    })

    setEscapeVars(nextEscapeVars)
    const frame = window.requestAnimationFrame(() => setCloudsAway(true))
    return () => window.cancelAnimationFrame(frame)
  }, [isHome])

  return (
    <div className={`${styles.wrap} ${isHome ? styles.home : ''} ${cloudsAway ? styles.cloudsAway : ''}`} aria-hidden="true" style={{ backgroundImage: `url(${skyImg})` }}>
      <div className={styles.cloudLayer}>
      {CLOUDS.map((c, i) => {
        const vars = { '--dur': c.dur, '--delay': c.delay, '--r': c.r } as OrbitVars
        return (
          <div className={styles.cloudEscape} style={escapeVars[i]} key={i}>
          <div key={i} className={`${styles.spin} ${c.rev ? styles.rev : ''}`} style={vars}>
            <div className={styles.offset}>
              <div className={styles.counter}>
                <img ref={(element) => { cloudRefs.current[i] = element }} src={`/elements/${c.img}.webp`} alt="" onError={hide}
                  className={styles.cloudImg} style={{ width: c.w }} />
              </div>
            </div>
          </div>
          </div>
        )
      })}

      {STARS.map((s, i) => (
        <img key={i} src={`/elements/${s.img}.webp`} alt="" onError={hide}
          className={styles.star} style={{ ...s.style, animationDelay: s.delay }} />
      ))}
      </div>
    </div>
  )
}
