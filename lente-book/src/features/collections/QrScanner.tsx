import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import styles from './QrScanner.module.css'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import type { ChallengeId } from '../challenges/challengeConfig'

type BarcodeResult = { rawValue?: string }
type BarcodeDetectorInstance = { detect: (source: HTMLVideoElement) => Promise<BarcodeResult[]> }
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance

const FIREBASE_HOSTS = new Set([
  'lentebook-a7c82.web.app',
  'lentebook-a7c82.firebaseapp.com',
])

const LOCATION_AREAS = new Set(['bathroom', 'smoking', 'bar', 'stages'])

const ROUTE_CHALLENGES: Record<string, ChallengeId> = {
  doop: 'doop',
  remix: 'remix',
  raai: 'guess',
  stem: 'vote',
  foto: 'photo',
  maat: 'friend',
}

function qrDestination(rawValue: string, expectedChallenge: ChallengeId) {
  const target = new URL(rawValue, window.location.origin)
  const trustedHost = target.origin === window.location.origin || FIREBASE_HOSTS.has(target.hostname)
  if (!trustedHost) return null

  const scanMatch = target.pathname.match(/^\/scan\/(doop|remix|guess|photo|friend|vote)$/)
  if (scanMatch && scanMatch[1] === expectedChallenge) {
    return `${target.pathname}${target.search}`
  }

  const locationChallenge = target.pathname.match(/^\/challenge\/(doop|remix)\/[^/]+$/)
  if (locationChallenge && locationChallenge[1] === expectedChallenge && LOCATION_AREAS.has(target.searchParams.get('area') ?? '')) {
    const query = new URLSearchParams()
    query.set('phrase', decodeURIComponent(target.pathname.split('/').at(-1) ?? ''))
    query.set('area', target.searchParams.get('area')!)
    return `/scan/${expectedChallenge}?${query.toString()}`
  }

  const challengeMatch = target.pathname.match(/^\/challenge\/(raai|foto|maat|stem)$/)
  if (challengeMatch && ROUTE_CHALLENGES[challengeMatch[1]] === expectedChallenge) {
    const query = new URLSearchParams()
    const area = target.searchParams.get('area')
    if (area && LOCATION_AREAS.has(area)) query.set('area', area)
    const suffix = query.toString()
    return `/scan/${expectedChallenge}${suffix ? `?${suffix}` : ''}`
  }

  return null
}

export default function QrScanner({ expectedChallenge, onClose }: { expectedChallenge: ChallengeId; onClose: () => void }) {
  useBodyScrollLock()
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()
  const [message, setMessage] = useState('Maak jou kamera gereed…')
  const [scanFeedback, setScanFeedback] = useState<'none' | 'wrong' | 'success'>('none')

  useEffect(() => {
    let stream: MediaStream | null = null
    let frame = 0
    let stopped = false
    let wrongFeedbackTimer = 0
    let successNavigationTimer = 0

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        const video = videoRef.current
        if (!video || stopped) return
        video.srcObject = stream
        await video.play()

        const Detector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
        if (!Detector) {
          setMessage('Jou blaaier kan die kamera oopmaak, maar ondersteun nie QR-skandering nie. Gebruik Chrome of Samsung Internet se nuutste weergawe.')
          return
        }

        const detector = new Detector({ formats: ['qr_code'] })
        setScanFeedback('none')
        setMessage('Hou die Lente Book QR-kode binne die raam.')

        const scan = async () => {
          if (stopped || !videoRef.current) return
          try {
            const [result] = await detector.detect(videoRef.current)
            if (result?.rawValue) {
              const destination = qrDestination(result.rawValue, expectedChallenge)
              if (destination) {
                stopped = true
                setScanFeedback('success')
                setMessage('Regte poster! Jou uitdaging maak nou oop.')
                successNavigationTimer = window.setTimeout(() => {
                  navigate(destination)
                }, 900)
                return
              }
              setScanFeedback('wrong')
              setMessage('Hierdie QR-kode pas nie by die gekose uitdaging nie. Skandeer die regte poster.')
              window.clearTimeout(wrongFeedbackTimer)
              wrongFeedbackTimer = window.setTimeout(() => {
                setScanFeedback('none')
                setMessage('Hou die Lente Book QR-kode binne die raam.')
              }, 1600)
            }
          } catch {
            // The video may not have a complete frame yet.
          }
          frame = window.requestAnimationFrame(scan)
        }
        frame = window.requestAnimationFrame(scan)
      } catch {
        setMessage('Ons kon nie die kamera oopmaak nie. Laat kamera-toegang toe en probeer weer.')
      }
    }

    void start()
    return () => {
      stopped = true
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(wrongFeedbackTimer)
      window.clearTimeout(successNavigationTimer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [expectedChallenge, navigate])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return createPortal((
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.scanner} role="dialog" aria-modal="true" aria-label="Skandeer ’n poster">
        <button type="button" className={styles.close} onClick={onClose} aria-label="Maak kamera toe">×</button>
        <p className={styles.kicker}>★ LENTE BINGO ★</p>
        <h2>Skandeer die poster</h2>
        <div className={styles.viewport}>
          <video ref={videoRef} muted playsInline />
          <span className={styles.scanFrame} aria-hidden="true" />
          {scanFeedback !== 'none' && (
            <div className={`${styles.scanFeedback} ${scanFeedback === 'success' ? styles.successPoster : styles.wrongPoster}`} role="status" aria-live="assertive">
              <strong>{scanFeedback === 'success' ? '✓ Regte poster' : '✕ Verkeerde poster'}</strong>
              <small>{scanFeedback === 'success' ? 'Jou uitdaging maak nou oop.' : 'Skandeer die poster vir hierdie uitdaging.'}</small>
            </div>
          )}
        </div>
        <p className={styles.message}>{message}</p>
      </section>
    </div>
  ), document.body)
}
