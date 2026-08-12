import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './QrScanner.module.css'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

type BarcodeResult = { rawValue?: string }
type BarcodeDetectorInstance = { detect: (source: HTMLVideoElement) => Promise<BarcodeResult[]> }
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance

export default function QrScanner({ onClose }: { onClose: () => void }) {
  useBodyScrollLock()
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()
  const [message, setMessage] = useState('Maak jou kamera gereed…')

  useEffect(() => {
    let stream: MediaStream | null = null
    let frame = 0
    let stopped = false

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
        setMessage('Hou die Lente Book QR-kode binne die raam.')

        const scan = async () => {
          if (stopped || !videoRef.current) return
          try {
            const [result] = await detector.detect(videoRef.current)
            if (result?.rawValue) {
              const target = new URL(result.rawValue, window.location.origin)
              if (target.origin === window.location.origin && target.pathname.startsWith('/scan/')) {
                stopped = true
                navigate(`${target.pathname}${target.search}`)
                return
              }
              setMessage('Dit is nie ’n geldige Lente Book QR-kode nie.')
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
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [navigate])

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Skandeer ’n poster">
      <section className={styles.scanner}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Maak kamera toe">×</button>
        <p className={styles.kicker}>★ LENTE BINGO ★</p>
        <h2>Skandeer die poster</h2>
        <div className={styles.viewport}>
          <video ref={videoRef} muted playsInline />
          <span aria-hidden="true" />
        </div>
        <p className={styles.message}>{message}</p>
      </section>
    </div>
  )
}
