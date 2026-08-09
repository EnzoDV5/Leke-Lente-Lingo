import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'

export type TextLoopShape = 'wave' | 'circle' | 'infinity' | 'arch' | 'line'
export type TextLoopDirection = 'forward' | 'reverse'

export interface TextLoopProps {
  text?: string; shape?: TextLoopShape; path?: string; speed?: number
  direction?: TextLoopDirection; separator?: string; curviness?: number
  fontSize?: number; fontWeight?: number | string; letterSpacing?: number
  uppercase?: boolean; color?: string; ribbon?: boolean; ribbonColor?: string
  ribbonWidth?: number; underlayColor?: string; pauseOnHover?: boolean; className?: string; style?: CSSProperties
}

const VIEW_W = 1200
const VIEW_H = 160
const CX = VIEW_W / 2
const CY = VIEW_H / 2

function buildPath(shape: TextLoopShape, curviness: number, ribbonWidth: number) {
  const c = Math.max(0, curviness)
  const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - 6)
  if (shape === 'circle') {
    const r = Math.min(90 + c * .95, room)
    return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`
  }
  if (shape === 'infinity') {
    const r = 150 + c * 1.4
    const h = Math.min(60 + c * .95, room)
    return `M ${CX} ${CY} C ${CX + r * .55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY} C ${CX + r} ${CY + h} ${CX + r * .55} ${CY + h} ${CX} ${CY} C ${CX - r * .55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY} C ${CX - r} ${CY + h} ${CX - r * .55} ${CY + h} ${CX} ${CY} Z`
  }
  if (shape === 'arch') {
    const rise = Math.min(120 + c * 1.1, room * 2)
    return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`
  }
  if (shape === 'line') return `M -320 ${CY} L ${VIEW_W + 320} ${CY}`
  const amplitude = Math.min(c * 2.2, room * 2)
  return `M -320 ${CY} Q -160 ${CY - amplitude} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${VIEW_W + 320} ${CY}`
}

export default function TextLoop({
  text = 'Lente Book', shape = 'wave', path, speed = 90, direction = 'forward',
  separator = '✦', curviness = 90, fontSize = 46, fontWeight = 800,
  letterSpacing = 2, uppercase = true, color = '#fff', ribbon = true,
  ribbonColor = '#5227ff', ribbonWidth = 86, underlayColor, pauseOnHover = true,
  className = '', style = {},
}: TextLoopProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const measureRef = useRef<SVGTextElement>(null)
  const headRef = useRef<SVGTextPathElement>(null)
  const [metrics, setMetrics] = useState({ length: 0, unitWidth: 0, reps: 1 })
  const pathId = `text-loop-${useId().replace(/:/g, '')}`
  const d = useMemo(() => path || buildPath(shape, curviness, ribbonWidth), [path, shape, curviness, ribbonWidth])
  const unit = useMemo(() => {
    const base = uppercase ? text.toUpperCase() : text
    return `${base}${separator ? `\u00a0${separator}\u00a0` : '\u00a0\u00a0\u00a0'}`
  }, [text, separator, uppercase])
  const textStyle = useMemo<CSSProperties>(() => ({
    fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px`,
  }), [fontSize, fontWeight, letterSpacing])

  useLayoutEffect(() => {
    let cancelled = false
    const measure = () => {
      if (cancelled || !pathRef.current || !measureRef.current) return
      try {
        const length = pathRef.current.getTotalLength()
        const width = measureRef.current.getComputedTextLength()
        if (length) setMetrics({
          length,
          unitWidth: width,
          reps: width > 0 ? Math.max(3, Math.ceil(length / width) + 3) : 3,
        })
      } catch { /* SVG is not measurable yet. */ }
    }
    measure()
    void document.fonts?.ready.then(measure).catch(() => undefined)
    return () => { cancelled = true }
  }, [d, unit, fontSize, fontWeight, letterSpacing])

  useEffect(() => {
    const { length, unitWidth } = metrics
    const head = headRef.current
    if (!head || !length || !unitWidth) return
    const apply = (offset: number) => {
      head.setAttribute('startOffset', String(offset))
    }
    const start = direction === 'reverse' ? 0 : -unitWidth
    const end = direction === 'reverse' ? -unitWidth : 0
    apply(start)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || speed <= 0) return
    const state = { offset: start }
    const tween = gsap.to(state, {
      offset: end,
      duration: unitWidth / speed, ease: 'none', repeat: -1,
      onUpdate: () => apply(state.offset),
    })
    const root = rootRef.current
    const pause = () => tween.pause()
    const resume = () => tween.resume()
    if (pauseOnHover && root) {
      root.addEventListener('pointerenter', pause)
      root.addEventListener('pointerleave', resume)
    }
    return () => {
      tween.kill()
      root?.removeEventListener('pointerenter', pause)
      root?.removeEventListener('pointerleave', resume)
    }
  }, [metrics, speed, direction, pauseOnHover])

  const loopText = unit.repeat(metrics.reps)
  return (
    <div ref={rootRef} className={className} style={style}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={text}>
        {underlayColor && (
          <path
            d={`${d} L ${VIEW_W + 320} ${VIEW_H + 80} L -320 ${VIEW_H + 80} Z`}
            fill={underlayColor}
            stroke="none"
            aria-hidden="true"
          />
        )}
        <path ref={pathRef} id={pathId} d={d} fill="none" stroke={ribbon ? ribbonColor : 'none'} strokeWidth={ribbon ? ribbonWidth : 0} strokeLinecap="round" strokeLinejoin="round" />
        <text ref={measureRef} style={{ ...textStyle, visibility: 'hidden' }} aria-hidden="true">{unit}</text>
        <text style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true"><textPath ref={headRef} href={`#${pathId}`}>{loopText}</textPath></text>
      </svg>
    </div>
  )
}
