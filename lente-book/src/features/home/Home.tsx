import Marquee from '../../components/layout/Marquee'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useLocation } from 'react-router-dom'
import Leaderboard from './sections/Leaderboard'
import PosterCollection from './sections/PosterCollection'
import HoeDitWerk from './sections/HoeDitWerk'
import lekeLenteLingoLogo from '../../assets/elements/Leke-lente-lingo.webp'
import binocularsElement from '../../assets/elements/poster elements/binuculars.webp'
import mouthElement from '../../assets/elements/poster elements/Mouth.webp'
import { useLivePhotos } from '../../hooks/useLivePhotos'
import { fallbackProfileAvatar, resolveProfileAvatar } from '../../lib/profileAvatars'
import styles from './Home.module.css'

const FESTIVAL_PHOTOS = [
  ['Sonstraal', '@mia', 'photo-1501386761578-eac5c94b800a'],
  ['Saamsing', '@liam', 'photo-1492684223066-81342ee5ff30'],
  ['Hoofverhoog', '@zara', 'photo-1470229722913-7c0e2dbbafd3'],
  ['Lenteklop', '@noah', 'photo-1506157786151-b8491531f063'],
  ['Kleurstorm', '@lize', 'photo-1524368535928-5b5e00ddc76b'],
  ['Feesligte', '@ethan', 'photo-1540039155733-5bb30b53aa14'],
  ['Dansvloer', '@ama', 'photo-1521337581100-8ca9a73a5f79'],
  ['Kitaarheld', '@luca', 'photo-1493225457124-a3eb161ffa5f'],
  ['Vriende', '@nina', 'photo-1505236858219-8359eb29e329'],
  ['Nagritme', '@kai', 'photo-1514525253161-7a46d19cd819'],
  ['Klankgolf', '@zoe', 'photo-1501612780327-45045538702b'],
  ['Goue uur', '@ben', 'photo-1464375117522-1311dd7d0b7a'],
  ['Feesgees', '@lea', 'photo-1472653431158-6364773b2a56'],
  ['Konfetti', '@jay', 'photo-1524650359799-842906ca1c06'],
  ['Someraand', '@faye', 'photo-1533174072545-7a4b6ad7a6c3'],
  ['Hande hoog', '@sam', 'photo-1496024840928-4c417adf211d'],
  ['Somerklank', '@ava', 'photo-1504704911898-68304a7d2807'],
  ['Liggies', '@mila', 'photo-1524368535928-5b5e00ddc76b'],
  ['Vrydaggevoel', '@josh', 'photo-1506157786151-b8491531f063'],
  ['Dans saam', '@cara', 'photo-1516280440614-37939bbacd81'],
  ['Sterrenag', '@leo', 'photo-1509824227185-9c5a01ceba0d'],
  ['Beste dag', '@ruby', 'photo-1527529482837-4698179dc6ce'],
  ['Musiekvriende', '@dani', 'photo-1529139574466-a303027c1d8b'],
  ['Laaste lied', '@theo', 'photo-1501386761578-eac5c94b800a'],
  ['Oggendfees', '@andi', 'photo-1492684223066-81342ee5ff30'],
  ['Spring hoog', '@rene', 'photo-1470229722913-7c0e2dbbafd3'],
  ['Lentevonk', '@kiki', 'photo-1540039155733-5bb30b53aa14'],
  ['Lekker lag', '@marc', 'photo-1505236858219-8359eb29e329'],
  ['Klankkleur', '@suri', 'photo-1514525253161-7a46d19cd819'],
  ['Feesfamilie', '@nico', 'photo-1472653431158-6364773b2a56'],
]

const MOBILE_PHOTO_POSITIONS = [
  [2, 1], [23, 4], [43, 0], [62, 3], [80, 1],
  [0, 18], [20, 15], [40, 19], [60, 16], [79, 20],
  [3, 32], [22, 35], [42, 31], [63, 36], [81, 33],
  [0, 51], [20, 48], [41, 52], [61, 49], [79, 53],
  [3, 65], [23, 68], [43, 64], [64, 69], [81, 66],
  [0, 83], [20, 80], [40, 84], [61, 81], [79, 85],
]

const PHOTO_TOTAL = 1284

type PhotoPositionStyle = CSSProperties & {
  '--photo-index': number
  '--mobile-photo-x': string
  '--mobile-photo-y': string
}

type HomeRouteState = {
  photoUploaded?: boolean
  photoId?: string
}

export default function Home() {
  const location = useLocation()
  const routeState = location.state as HomeRouteState | null
  const highlightedPhotoId = routeState?.photoUploaded ? routeState.photoId : undefined
  const { photos: livePhotos } = useLivePhotos()
  const hasLivePhotos = livePhotos.length > 0
  // DEMO: keep the dummy wall fully populated even once real photos exist —
  // live uploads lead the wall (so a freshly added photo is always visible)
  // and demo cards fill the remaining slots, instead of the demo wall
  // disappearing the moment a single real photo comes in.
  const heroPhotos = [
    ...livePhotos.map((photo) => ({
      id: photo.id,
      word: photo.word,
      name: photo.createdByUsername,
      image: photo.downloadUrl,
      avatar: resolveProfileAvatar(photo.createdByAvatar) ?? fallbackProfileAvatar(photo.createdByUid),
    })),
    ...FESTIVAL_PHOTOS.map(([word, name, image], index) => ({
      id: `demo-${index}`,
      word,
      name,
      image: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=600&q=82`,
      avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}`,
    })),
  ].slice(0, MOBILE_PHOTO_POSITIONS.length)
  const photoTarget = hasLivePhotos ? livePhotos.length : PHOTO_TOTAL
  const wallRef = useRef<HTMLDivElement>(null)
  const heroLogoRef = useRef<HTMLImageElement>(null)
  const heroMouthRef = useRef<HTMLImageElement>(null)
  const cardFallProgress = useRef<number[]>([])
  const cardFallAnimations = useRef<Animation[]>([])
  const wallIsResetting = useRef(false)
  const fallIsArmed = useRef(false)
  const fallSequenceComplete = useRef(false)
  const previousScrollPosition = useRef(0)
  const [photoCount, setPhotoCount] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) {
      setPhotoCount(photoTarget)
      return
    }

    setPhotoCount(0)
    let animationFrame = 0
    let startTime: number | null = null
    const delay = 700
    const duration = 1500

    const countUp = (time: number) => {
      if (startTime === null) startTime = time
      const elapsed = time - startTime

      if (elapsed < delay) {
        animationFrame = window.requestAnimationFrame(countUp)
        return
      }

      const progress = Math.min((elapsed - delay) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setPhotoCount(Math.round(photoTarget * eased))

      if (progress < 1) animationFrame = window.requestAnimationFrame(countUp)
    }

    animationFrame = window.requestAnimationFrame(countUp)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [photoTarget])

  useLayoutEffect(() => {
    const targets = {
      logo: heroLogoRef.current,
      mouth: heroMouthRef.current,
    }
    const sharedPieces = Array.from(
      document.querySelectorAll<HTMLImageElement>(
        '[data-shared-brand-piece]',
      ),
    )
    const animations: Animation[] = []

    if (!sharedPieces.length) return

    // Hide the real hero pieces synchronously, before the browser paints this
    // frame. Deferring this into the rAF below (as it used to be) let the
    // real logo/mouth flash fully visible for a frame while the shared clone
    // sat on top of it, reading as two overlapping logos swapping places.
    sharedPieces.forEach((sharedPiece) => {
      const piece =
        sharedPiece.dataset.sharedBrandPiece as keyof typeof targets
      const target = targets[piece]
      if (target) target.style.visibility = 'hidden'
    })

    const firstFrame = window.requestAnimationFrame(() => {
      sharedPieces.forEach((sharedPiece) => {
        const piece =
          sharedPiece.dataset.sharedBrandPiece as keyof typeof targets
        const target = targets[piece]
        if (!target) return

        const source = sharedPiece.getBoundingClientRect()
        const destination = target.getBoundingClientRect()
        const moveX =
          destination.left +
          destination.width / 2 -
          (source.left + source.width / 2)
        const moveY =
          destination.top +
          destination.height / 2 -
          (source.top + source.height / 2)
        const scale =
          destination.width /
          Math.max(source.width, 1)

        const animation = sharedPiece.animate(
          [
            { transform: 'translate3d(0, 0, 0) scale(1)' },
            { transform: `translate3d(${moveX}px, ${moveY}px, 0) scale(${scale})` },
          ],
          {
            duration: 980,
            easing: 'cubic-bezier(.16, 1, .3, 1)',
            fill: 'forwards',
          },
        )

        animations.push(animation)

        void animation.finished.catch(() => undefined).then(() => {
          sharedPiece.remove()
          target.style.visibility = ''
        })
      })
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      animations.forEach((animation) => animation.cancel())
      sharedPieces.forEach((sharedPiece) => sharedPiece.remove())
      Object.values(targets).forEach((target) => {
        if (target) target.style.visibility = ''
      })
    }
  }, [])

  useEffect(() => {
    let animationFrame = 0

    const updatePhotoFall = () => {
      animationFrame = 0
      const wall = wallRef.current
      if (!wall) return

      const distance = Math.max(0, window.scrollY)
      const cards = wall.children
      const wallDocumentTop =
        wall.getBoundingClientRect().top +
        distance
      const heroBottom =
        wallDocumentTop + wall.offsetHeight
      const scraperEdge =
        window.innerWidth <= 900
          ? 78
          : 108

      const resetCards = () => {
        cardFallAnimations.current.forEach(
          (animation) => animation.cancel(),
        )
        cardFallAnimations.current = []
        Array.from(cards).forEach((card) => {
          const element = card as HTMLElement
          element.style.translate = ''
          element.style.rotate = ''
          element.style.opacity = ''
        })
        cardFallProgress.current = []
      }

      if (distance >= heroBottom) {
        resetCards()
        wallIsResetting.current = true
        fallSequenceComplete.current = true
        return
      }

      if (
        wallIsResetting.current ||
        fallSequenceComplete.current
      ) {
        resetCards()
        if (distance <= 8) {
          wallIsResetting.current = false
          fallIsArmed.current = false
          fallSequenceComplete.current = false
          previousScrollPosition.current = distance
        }
        return
      }

      if (!fallIsArmed.current) return

      Array.from(cards).forEach((card, index) => {
        const element = card as HTMLElement
        const cardTop =
          wallDocumentTop +
          element.offsetTop
        const releasePoint = Math.max(
          0,
          cardTop - scraperEdge,
        )
        if (
          distance < releasePoint ||
          cardFallProgress.current[index]
        ) {
          return
        }

        cardFallProgress.current[index] = 1
        const direction = index % 2 === 0 ? -1 : 1
        const bounds = element.getBoundingClientRect()
        const dropDistance =
          window.innerHeight -
          bounds.top +
          bounds.height +
          320
        const drift = direction * (70 + (index % 5) * 24)
        const spin = direction * (52 + (index % 6) * 13)

        const animation = element.animate(
          [
            { translate: '0 0', rotate: '0deg' },
            { translate: `${drift}px ${dropDistance}px`, rotate: `${spin}deg` },
          ],
          {
            duration: 1350 + (index % 5) * 55,
            easing: 'linear',
            fill: 'forwards',
          },
        )
        cardFallAnimations.current.push(animation)
      })
    }

    const handleScroll = () => {
      const currentScroll = Math.max(
        0,
        window.scrollY,
      )
      const isMovingDown =
        currentScroll >
        previousScrollPosition.current

      if (
        isMovingDown &&
        currentScroll > 12 &&
        !wallIsResetting.current &&
        !fallSequenceComplete.current
      ) {
        fallIsArmed.current = true
      }
      previousScrollPosition.current =
        currentScroll

      // Once the wall has fallen and been reset, scrolling farther down has
      // no visual work left to do. Wait until the user returns to the top
      // instead of measuring and clearing every card on every scroll frame.
      if (fallSequenceComplete.current && currentScroll > 8) return
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(updatePhotoFall)
    }

    updatePhotoFall()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      cardFallAnimations.current.forEach(
        (animation) => animation.cancel(),
      )
    }
  }, [])

  return (
    <>
      <section
        className={styles.cloudHero}
        aria-label="Leke Lente Lingo"
      >
        <div ref={wallRef} className={styles.festivalWall}>
          {heroPhotos.map((photo, index) => (
            <figure
              className={`${styles.festivalPhoto} ${photo.id === highlightedPhotoId ? styles.newFestivalPhoto : ''}`}
              key={photo.id}
              data-photo-id={photo.id}
              style={{
                '--photo-index': index,
                '--mobile-photo-x':
                  `${MOBILE_PHOTO_POSITIONS[index][0]}%`,
                '--mobile-photo-y':
                  `${MOBILE_PHOTO_POSITIONS[index][1]}%`,
              } as PhotoPositionStyle}
            >
              <img
                src={photo.image}
                alt={`${photo.word} deur ${photo.name}`}
                fetchPriority={index < 8 ? 'auto' : 'low'}
                decoding="async"
              />
              <figcaption>
                <strong>{photo.word}</strong>
                <span className={styles.photoUser}>
                  <img
                    src={photo.avatar}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{photo.name}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={styles.heroBrand}>
          <img
            ref={heroMouthRef}
            className={styles.heroMouth}
            src={mouthElement}
            alt=""
            aria-hidden="true"
          />

          <img
            ref={heroLogoRef}
            data-home-hero-logo
            src={lekeLenteLingoLogo}
            alt="Leke Lente Lingo"
            className={[
              styles.heroLogo,
            ].filter(Boolean).join(' ')}
          />

          <img
            className={styles.heroBinoculars}
            src={binocularsElement}
            alt=""
            aria-hidden="true"
          />

          <div className={styles.photoTotal} aria-label={`${photoTarget.toLocaleString('af-ZA')} foto's gedeel`}>
            <span className={styles.cameraIcon} aria-hidden="true">
              <i />
            </span>
            <span className={styles.photoCountCopy} aria-hidden="true">
              <strong>{photoCount.toLocaleString('af-ZA')}</strong>
              <small>FOTO'S GEDEEL</small>
            </span>
            <span className={styles.liveSpark} aria-hidden="true">
              <i />
              LIVE
            </span>
          </div>
        </div>
      </section>

      <div className={styles.homeContent}>
        <Marquee />
        <Leaderboard />
        <PosterCollection />
        <HoeDitWerk />
      </div>
    </>
  )
}
