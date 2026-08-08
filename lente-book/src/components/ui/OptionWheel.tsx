import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'

import styles from './OptionWheel.module.css'

type Side = 'left' | 'right'

export type OptionWheelProps = {
  items: string[]
  defaultSelected?: number
  onChange?: (index: number, item: string) => void
  onSelect?: (index: number, item: string) => void
  textColor?: string
  activeColor?: string
  side?: Side
  fontSize?: number
  spacing?: number
  curve?: number
  tilt?: number
  blur?: number
  fade?: number
  minOpacity?: number
  smoothing?: number
  inset?: number
  loop?: boolean
  draggable?: boolean
  className?: string
}

type WheelVars = CSSProperties & {
  '--ow-text-color': string
  '--ow-active-color': string
  '--ow-font-size': string
  '--ow-inset': string
}

export default function OptionWheel({
  items,
  defaultSelected = 0,
  onChange,
  onSelect,
  textColor = '#ed4924',
  activeColor = '#17150f',
  side = 'left',
  fontSize = 1.7,
  spacing = 1.55,
  curve = 1,
  tilt = 10,
  blur = .7,
  fade = .2,
  minOpacity = .12,
  smoothing = 170,
  inset = 44,
  loop = false,
  draggable = true,
  className = '',
}: OptionWheelProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const position = useRef(defaultSelected)
  const target = useRef(defaultSelected)
  const frame = useRef<number | null>(null)
  const previousTime = useRef(0)
  const drag = useRef<{ y: number; start: number; id: number } | null>(null)
  const dragged = useRef(false)
  const selectedRef = useRef(defaultSelected)
  const [selected, setSelected] = useState(defaultSelected)
  const [isDragging, setIsDragging] = useState(false)

  const draw = useCallback((now: number) => {
    const rowHeight = Math.max(fontSize * spacing * 16, 1)
    const elapsed = Math.min((now - previousTime.current) / 1000, .05)
    previousTime.current = now
    const amount = 1 - Math.exp(-elapsed / Math.max(smoothing / 1000, .001))
    const next = position.current + (target.current - position.current) * amount
    const settled = Math.abs(target.current - next) < .001
    position.current = settled ? target.current : next
    const angleStep = tilt * Math.PI / 180
    const radius = angleStep > .0005 ? rowHeight / angleStep : 0
    const mirror = side === 'right' ? -1 : 1

    itemRefs.current.forEach((element, index) => {
      if (!element) return
      let distance = index - position.current
      if (loop && items.length > 1) {
        distance = ((distance % items.length) + items.length) % items.length
        if (distance > items.length / 2) distance -= items.length
      }
      const absoluteDistance = Math.abs(distance)
      const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, distance * angleStep))
      const y = radius ? radius * Math.sin(angle) : distance * rowHeight
      const x = radius ? -mirror * radius * (1 - Math.cos(angle)) * curve : 0
      const rotation = mirror * angle * 180 / Math.PI
      element.style.transform = `translate(${x}px, calc(${y}px - 50%)) rotate(${rotation}deg)`
      element.style.opacity = `${Math.max(minOpacity, 1 - absoluteDistance * fade)}`
      element.style.filter = blur ? `blur(${absoluteDistance * blur}px)` : 'none'
      element.style.setProperty('--ow-strength', `${Math.max(0, 1 - Math.min(absoluteDistance, 1))}`)
    })

    frame.current = settled ? null : requestAnimationFrame(draw)
  }, [blur, curve, fade, fontSize, items.length, loop, minOpacity, side, smoothing, spacing, tilt])

  const moveTo = useCallback((value: number, snap = false) => {
    let next = value
    if (!loop) next = Math.min(Math.max(next, 0), items.length - 1)
    if (snap) next = Math.round(next)
    target.current = next
    const index = ((Math.round(next) % items.length) + items.length) % items.length
    if (index !== selectedRef.current) {
      selectedRef.current = index
      setSelected(index)
      onChange?.(index, items[index])
    }
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    previousTime.current = performance.now()
    frame.current = requestAnimationFrame(draw)
  }, [draw, items, loop, onChange])

  useEffect(() => {
    moveTo(defaultSelected, true)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [defaultSelected, moveTo])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      moveTo(target.current + Math.sign(event.deltaY), true)
    }
    root.addEventListener('wheel', handleWheel, { passive: false })
    return () => root.removeEventListener('wheel', handleWheel)
  }, [moveTo])

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggable) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    rootRef.current?.setPointerCapture(event.pointerId)
    drag.current = { y: event.clientY, start: position.current, id: event.pointerId }
    dragged.current = false
    setIsDragging(true)
  }

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== event.pointerId) return
    event.preventDefault()
    const delta = event.clientY - drag.current.y
    if (Math.abs(delta) > 5) {
      dragged.current = true
      const rowHeight = Math.max(fontSize * spacing * 16, 1)
      let next = drag.current.start - delta / rowHeight
      if (!loop) next = Math.min(Math.max(next, 0), items.length - 1)

      // While held, the wheel follows the finger exactly. Smoothing is only
      // used for the final snap after release, so the end stops feel firm.
      target.current = next
      position.current = next
      const activeIndex = ((Math.round(next) % items.length) + items.length) % items.length
      if (activeIndex !== selectedRef.current) {
        selectedRef.current = activeIndex
        setSelected(activeIndex)
        onChange?.(activeIndex, items[activeIndex])
      }
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
      previousTime.current = performance.now()
      draw(previousTime.current)
    }
  }

  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== event.pointerId) return
    const pointerId = drag.current.id
    const didDrag = dragged.current
    drag.current = null
    setIsDragging(false)
    if (rootRef.current?.hasPointerCapture(pointerId)) {
      rootRef.current.releasePointerCapture(pointerId)
    }
    if (didDrag) {
      moveTo(position.current, true)
      window.setTimeout(() => { dragged.current = false }, 0)
    }
  }

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const direction = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1
    moveTo(Math.round(target.current) + direction, true)
  }

  const choose = (index: number) => {
    if (dragged.current) return
    if (index === selected) {
      onSelect?.(index, items[index])
      return
    }
    moveTo(index, true)
  }

  return (
    <div
      ref={rootRef}
      role="listbox"
      aria-label="Hoofkieslys-wiel"
      tabIndex={0}
      className={`${styles.wheel} ${isDragging ? styles.dragging : ''} ${className}`}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`,
      } as WheelVars}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerEnd}
      onPointerCancel={pointerEnd}
      onKeyDown={keyDown}
    >
      {items.map((item, index) => (
        <button
          type="button"
          key={item}
          ref={(element) => { itemRefs.current[index] = element }}
          role="option"
          aria-selected={selected === index}
          aria-label={item === '__logout__' ? 'Teken uit' : item}
          className={`${styles.option} ${side === 'right' ? styles.right : styles.left} ${selected === index ? styles.selected : ''}`}
          onClick={() => choose(index)}
        >
          <span className={styles.number}>{index + 1}</span>
          <span className={styles.label}>
          {item === '__logout__' ? (
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={styles.logoutIcon}
            >
              <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10M14.5 8.5 18 12l-3.5 3.5M9 12h9" />
            </svg>
          ) : item}
          </span>
        </button>
      ))}
    </div>
  )
}
