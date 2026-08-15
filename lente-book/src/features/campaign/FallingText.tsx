import { useEffect, useMemo, useRef, useState } from 'react'
import Matter from 'matter-js'

import styles from './FallingText.module.css'

type FallingTextItem = { id: string; text: string; scale?: number }

export type FallingTextProps = {
  text?: string
  items?: FallingTextItem[]
  highlightWords?: string[]
  highlightClass?: string
  className?: string
  appearance?: 'card' | 'backdrop'
  decorative?: boolean
  trigger?: 'auto' | 'scroll' | 'click' | 'hover'
  gravity?: number
  mouseConstraintStiffness?: number
  fontSize?: string
  wordSpacing?: string
  bottomBoundaryInset?: number
  scrollThreshold?: number
}

export default function FallingText({
  text = '',
  items,
  highlightWords = [],
  highlightClass = '',
  className = '',
  appearance = 'card',
  decorative = false,
  trigger = 'click',
  gravity = 1,
  mouseConstraintStiffness = .2,
  fontSize = '1rem',
  wordSpacing = '2px',
  bottomBoundaryInset = 0,
  scrollThreshold = .18,
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [effectStarted, setEffectStarted] = useState(false)

  const words = useMemo<FallingTextItem[]>(() => items ?? text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => ({ id: `${word}-${index}`, text: word })), [items, text])

  useEffect(() => {
    if (trigger === 'auto') {
      setEffectStarted(true)
      return
    }

    if (trigger !== 'scroll' || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setEffectStarted(true)
        observer.disconnect()
      },
      { threshold: scrollThreshold },
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [scrollThreshold, trigger])

  useEffect(() => {
    if (!effectStarted || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const container = containerRef.current
    const textElement = textRef.current
    if (!container || !textElement) return

    const initialContainerRect = container.getBoundingClientRect()
    const width = initialContainerRect.width
    const height = initialContainerRect.height
    if (width <= 0 || height <= 0) return

    const {
      Bodies,
      Body,
      Constraint,
      Engine,
      Runner,
      World,
    } = Matter

    const engine = Engine.create()
    engine.enableSleeping = true
    engine.world.gravity.y = gravity

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' },
    }
    const topBoundary = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions)
    const boundaries = [
      Bodies.rectangle(width / 2, height - bottomBoundaryInset + 25, width, 50, boundaryOptions),
      Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions),
      Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions),
      ...(appearance === 'backdrop'
        ? []
        : [topBoundary]),
    ]

    type WordBodyRecord = {
      element: HTMLElement
      body: Matter.Body
      width: number
      height: number
    }

    let wordBodies: WordBodyRecord[] = []
    let topBoundaryAdded = appearance !== 'backdrop'

    const createWordBody = (element: HTMLElement, index: number): WordBodyRecord => {
      const containerRect = container.getBoundingClientRect()
      const rect = element.getBoundingClientRect()
      const elementWidth = element.offsetWidth || rect.width
      const elementHeight = element.offsetHeight || rect.height
      const halfWidth = elementWidth / 2
      const halfHeight = elementHeight / 2
      const flowX = rect.left - containerRect.left + halfWidth
      const flowY = rect.top - containerRect.top + halfHeight
      const horizontalSeed = ((index + 1) * .61803398875 + Math.random() * .12) % 1
      const verticalSeed = ((index + 1) * .754877666 + Math.random() * .3) % 1
      const rotationSeed = ((index + 1) * .41421356237 + Math.random() * .4) % 1
      const spreadX = halfWidth + 8 + horizontalSeed * Math.max(0, width - (halfWidth + 8) * 2)
      const startingHeight = Math.max(150, height * .2)
      const verticalSpread = Math.max(300, height * .58)
      const spreadY = -startingHeight - verticalSeed * verticalSpread - halfHeight
      const requestedX = appearance === 'backdrop' ? spreadX : flowX
      const requestedY = appearance === 'backdrop'
        ? topBoundaryAdded
          ? halfHeight + 10 + Math.random() * Math.min(80, height * .12)
          : spreadY
        : flowY
      const x = Math.min(
        width - halfWidth - 2,
        Math.max(halfWidth + 2, requestedX),
      )
      const y = appearance === 'backdrop'
        ? requestedY
        : Math.min(
            height - bottomBoundaryInset - halfHeight - 2,
            Math.max(halfHeight + 2, requestedY),
          )
      const body = Bodies.rectangle(x, y, Math.max(elementWidth, 12), Math.max(elementHeight, 12), {
        render: { fillStyle: 'transparent' },
        restitution: .42,
        frictionAir: .035,
        friction: .55,
        frictionStatic: .82,
        sleepThreshold: 34,
      })
      if (appearance === 'backdrop') {
        Body.setAngle(body, (rotationSeed - .5) * Math.PI * 1.2)
      }
      Body.setVelocity(body, {
        x: appearance === 'backdrop'
          ? (Math.random() - .5) * 1.8
          : (Math.random() - .5) * 4.5,
        y: 0,
      })
      Body.setAngularVelocity(body, appearance === 'backdrop'
        ? (Math.random() - .5) * .095
        : (Math.random() - .5) * .045)
      element.style.position = 'absolute'
      element.style.left = `${x}px`
      element.style.top = `${y}px`
      element.style.transform = 'translate(-50%, -50%)'
      return { element, body, width: elementWidth, height: elementHeight }
    }

    World.add(engine.world, [
      ...boundaries,
    ])

    const syncWordBodies = () => {
      const elements = Array.from(textElement.querySelectorAll<HTMLElement>('[data-falling-word]'))
      const currentElements = new Set(elements)

      wordBodies = wordBodies.filter((record) => {
        if (currentElements.has(record.element)) return true
        World.remove(engine.world, record.body)
        record.element.style.removeProperty('left')
        record.element.style.removeProperty('position')
        record.element.style.removeProperty('top')
        record.element.style.removeProperty('transform')
        return false
      })

      const knownElements = new Set(wordBodies.map(({ element }) => element))
      elements.forEach((element, index) => {
        if (knownElements.has(element)) return
        const record = createWordBody(element, index)
        wordBodies.push(record)
        World.add(engine.world, record.body)
      })

      wordBodies.forEach((record) => {
        const nextWidth = record.element.offsetWidth
        const nextHeight = record.element.offsetHeight
        if (!nextWidth || !nextHeight) return
        if (Math.abs(nextWidth - record.width) < 1 && Math.abs(nextHeight - record.height) < 1) return
        Body.scale(record.body, nextWidth / record.width, nextHeight / record.height)
        record.width = nextWidth
        record.height = nextHeight
      })
    }

    syncWordBodies()
    container.dataset.physicsReady = 'true'
    const wordObserver = new MutationObserver(syncWordBodies)
    wordObserver.observe(textElement, { childList: true })
    textElement.addEventListener('falling-items-change', syncWordBodies)

    type ActiveDrag = {
      pointerId: number
      record: WordBodyRecord
      constraint: Matter.Constraint
      element: HTMLElement
    }

    let activeDrag: ActiveDrag | null = null

    const pointerPosition = (event: PointerEvent, record: WordBodyRecord) => {
      const rect = container.getBoundingClientRect()
      const halfWidth = record.width / 2 + 3
      const halfHeight = record.height / 2 + 3
      return {
        x: Math.max(halfWidth, Math.min(width - halfWidth, event.clientX - rect.left)),
        y: Math.max(halfHeight, Math.min(height - bottomBoundaryInset - halfHeight, event.clientY - rect.top)),
      }
    }

    const releaseDrag = (event?: PointerEvent) => {
      if (!activeDrag || (event && event.pointerId !== activeDrag.pointerId)) return
      const releasedBody = activeDrag.record.body
      World.remove(engine.world, activeDrag.constraint)
      if (activeDrag.element.hasPointerCapture(activeDrag.pointerId)) {
        activeDrag.element.releasePointerCapture(activeDrag.pointerId)
      }
      if (releasedBody.speed < 1.8) {
        Body.setVelocity(releasedBody, { x: 0, y: 0 })
        Body.setAngularVelocity(releasedBody, 0)
      }
      activeDrag = null
    }

    const handlePointerDown = (event: PointerEvent) => {
      const element = (event.target as HTMLElement).closest<HTMLElement>('[data-falling-word]')
      if (!element) return
      const record = wordBodies.find((candidate) => candidate.element === element)
      if (!record) return

      releaseDrag()
      event.preventDefault()
      element.setPointerCapture(event.pointerId)
      const constraint = Constraint.create({
        pointA: pointerPosition(event, record),
        bodyB: record.body,
        pointB: { x: 0, y: 0 },
        stiffness: Math.min(mouseConstraintStiffness, .72),
        damping: .3,
        length: 0,
        render: { visible: false },
      })
      activeDrag = {
        pointerId: event.pointerId,
        record,
        constraint,
        element,
      }
      World.add(engine.world, constraint)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return
      event.preventDefault()
      const point = pointerPosition(event, activeDrag.record)
      activeDrag.constraint.pointA.x = point.x
      activeDrag.constraint.pointA.y = point.y
    }

    const handlePointerEnd = (event: PointerEvent) => releaseDrag(event)

    textElement.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)

    const runner = Runner.create()
    Runner.run(runner, engine)

    let animationFrame = 0
    const updateWords = () => {
      if (
        appearance === 'backdrop' &&
        !topBoundaryAdded &&
        wordBodies.length > 0 &&
        wordBodies.every(({ body }) => body.bounds.min.y >= -2)
      ) {
        World.add(engine.world, topBoundary)
        topBoundaryAdded = true
      }

      wordBodies.forEach(({ body, element }) => {
        let correctionX = 0
        let correctionY = 0
        const escapeTolerance = 8

        if (body.bounds.min.x < -escapeTolerance) correctionX = -body.bounds.min.x
        if (body.bounds.max.x > width + escapeTolerance) correctionX = width - body.bounds.max.x
        if (topBoundaryAdded && body.bounds.min.y < -escapeTolerance) correctionY = -body.bounds.min.y
        if (body.bounds.max.y > height - bottomBoundaryInset + escapeTolerance) {
          correctionY = height - bottomBoundaryInset - body.bounds.max.y
        }

        if (correctionX || correctionY) {
          Body.translate(body, { x: correctionX, y: correctionY })
          Body.setVelocity(body, {
            x: correctionX ? -body.velocity.x * .35 : body.velocity.x,
            y: correctionY ? -body.velocity.y * .35 : body.velocity.y,
          })
        }

        element.style.left = `${body.position.x}px`
        element.style.top = `${body.position.y}px`
        element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
      })
      animationFrame = window.requestAnimationFrame(updateWords)
    }
    animationFrame = window.requestAnimationFrame(updateWords)

    return () => {
      delete container.dataset.physicsReady
      window.cancelAnimationFrame(animationFrame)
      wordObserver.disconnect()
      textElement.removeEventListener('falling-items-change', syncWordBodies)
      textElement.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
      releaseDrag()
      Runner.stop(runner)
      wordBodies.forEach(({ element }) => {
        element.style.removeProperty('left')
        element.style.removeProperty('position')
        element.style.removeProperty('top')
        element.style.removeProperty('transform')
      })
      World.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [appearance, bottomBoundaryInset, effectStarted, gravity, mouseConstraintStiffness])

  useEffect(() => {
    textRef.current?.dispatchEvent(new Event('falling-items-change'))
  }, [items])

  const startEffect = () => {
    if (!effectStarted && (trigger === 'click' || trigger === 'hover')) {
      setEffectStarted(true)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${appearance === 'backdrop' ? styles.backdrop : ''} ${effectStarted ? styles.started : ''} ${className}`.trim()}
      aria-hidden={decorative || undefined}
      onClick={trigger === 'click' ? startEffect : undefined}
      onMouseEnter={trigger === 'hover' ? startEffect : undefined}
    >
      <div
        ref={textRef}
        className={styles.text}
        style={{ fontSize, lineHeight: 1.35 }}
      >
        {words.map((word) => {
          const highlighted = highlightWords.includes(word.text)
          return (
            <span
              data-falling-word
              className={`${styles.word} ${highlighted ? highlightClass : ''}`.trim()}
              style={{
                fontSize: `${word.scale ?? 1}em`,
                marginInline: wordSpacing,
              }}
              key={word.id}
            >
              {word.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
