import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import lekeLenteLingoLogo from '../../assets/elements/Leke-lente-lingo.webp'
import sparkPinkFilled from '../../assets/elements/poster elements/sparkPink filled.webp'
import sparkPinkOutline from '../../assets/elements/poster elements/sparkPink outline.webp'
import mouthElement from '../../assets/elements/poster elements/Mouth.webp'
import TopBar from '../../components/layout/TopBar'
import PageLoader from '../../components/ui/PageLoader'
import { PROFILE_AVATARS } from '../../lib/profileAvatars'
import { useAuth } from '../auth/AuthContext'
import { useCampaign } from '../campaign/CampaignProvider'
import styles from './Onboarding.module.css'

const PROFIEL_KLEURE = [
  '#f5c518',
  '#18d860',
  '#f81878',
  '#f898c0',
  '#7828b8',
  '#3151df',
]

const PROFIEL_FOTOS = PROFILE_AVATARS.map((avatar, index) => ({
  id: avatar.id,
  emoji: avatar.id,
  naam: avatar.name,
  kleur: PROFIEL_KLEURE[index % PROFIEL_KLEURE.length],
  image: avatar.src,
}))

const REELS = [
  {
    n: 1,
    titel: 'Vind',
    beskrywing:
      'Scan ’n Lente Book-poster by die fees.',
  },
  {
    n: 2,
    titel: 'Skep',
    beskrywing:
      'Maak ’n nuwe Afrikaanse woord vir die scenario.',
  },
  {
    n: 3,
    titel: 'stem & versamel',
    beskrywing:
      'Gee jou gunstelinge ’n stem en bou jou versameling.',
  },
]

const STAPPE = [
  {
    n: 1,
    titel: 'Welkom',
    beskrywing: 'Begin jou Lente Book-avontuur.',
  },
  {
    n: 2,
    titel: 'Die reëls',
    beskrywing: 'Vind, skep, gee stemme en versamel jou feeswoorde.',
  },
  {
    n: 3,
    titel: 'Jou profiel',
    beskrywing: 'Kies jou avatar en maak jou unieke gebruikersnaam.',
  },
]

type OnboardingStap = 1 | 2 | 3

type UsernameStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'invalid'
  | 'error'

type TransitionPhase =
  | 'idle'
  | 'success'
  | 'exit-forward'
  | 'enter-forward'
  | 'exit-back'
  | 'enter-back'

type SuccessState = {
  title: string
  text: string
}

type LocationState = {
  from?: string
  reverseOnboarding?: boolean
  returnLogoLeft?: number
  returnLogoTop?: number
  returnLogoWidth?: number
  returnLogoHeight?: number
}

type LogoTransitionVars = CSSProperties & {
  '--logo-start-y': string
  '--logo-shift-x': string
  '--logo-shift-y': string
  '--logo-frozen-width': string
  '--logo-frozen-height': string
  '--logo-final-scale': string
}

type StapTrackerVars = CSSProperties & {
  '--spark-outline-url': string
  '--spark-filled-url': string
}

function wag(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

export default function Onboarding() {
  const { phase } = useCampaign()
  const {
    user,
    profile,
    loading,
    profileLoading,
    authError,
    checkUsernameAvailability,
    saveProfile,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  useLayoutEffect(() => {
    document.documentElement.classList.add('lente-onboarding')

    return () => {
      document.documentElement.classList.remove('lente-onboarding')
    }
  }, [])

  // Warm the lazy-loaded home chunk while the user is still onboarding.
  // animeerNaTuis() waits on this promise before navigating — if it doesn't,
  // the Suspense fallback (PageLoader, which renders its own copy of this
  // same logo) can still win the race on a slow connection and flash its
  // logo in and out right as the flying clone lands, breaking the illusion
  // of a single continuous logo.
  const homeChunkPromiseRef = useRef<Promise<unknown> | null>(null)

  useEffect(() => {
    homeChunkPromiseRef.current = import('../campaign/CampaignHome')
  }, [])

  const state =
    location.state as LocationState | null

  const authReturnPath =
    state?.from ??
    window.sessionStorage.getItem('lente-auth-return') ??
    '/'

  const [stap, setStap] =
    useState<OnboardingStap>(1)

  const [
    hoogsteStap,
    setHoogsteStap,
  ] = useState<OnboardingStap>(1)

  const [username, setUsername] =
    useState('')

  const [karakter, setKarakter] =
    useState(PROFIEL_FOTOS[0]?.id ?? '')

  const [avatarDirection, setAvatarDirection] =
    useState<-1 | 1>(1)
  const [avatarAnimation, setAvatarAnimation] =
    useState(0)

  const [saving, setSaving] =
    useState(false)

  const [
    usernameStatus,
    setUsernameStatus,
  ] = useState<UsernameStatus>('idle')

  const [
    transitionPhase,
    setTransitionPhase,
  ] = useState<TransitionPhase>('idle')

  const [
    successState,
    setSuccessState,
  ] = useState<SuccessState | null>(null)

  const [
    isTransitioning,
    setIsTransitioning,
  ] = useState(false)

  const [
    showInlineLoader,
    setShowInlineLoader,
  ] = useState(false)

  const [
    homeTransition,
    setHomeTransition,
  ] = useState(false)

  const logoRef =
    useRef<HTMLImageElement>(null)
  const mouthRef =
    useRef<HTMLImageElement>(null)
  const contentScrollRef =
    useRef<HTMLDivElement>(null)

  const logoTransitionVars: LogoTransitionVars = {
    '--logo-start-y': '0px',
    '--logo-shift-x': '0px',
    '--logo-shift-y': '0px',
    '--logo-frozen-width': 'auto',
    '--logo-frozen-height': 'auto',
    '--logo-final-scale': '1',
  }

  const [
    returnTransition,
    setReturnTransition,
  ] = useState(
    Boolean(
      state?.reverseOnboarding ||
      window.sessionStorage.getItem(
        'lente-return-onboarding',
      ),
    ),
  )

  const skoonUsername = username
    .trim()
    .replace(/^@/, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()

  const usernameGeldig =
    skoonUsername.length >= 3 &&
    usernameStatus === 'available'

  const avatarKeuses = PROFIEL_FOTOS

  const avatarIndex = Math.max(
    0,
    avatarKeuses.findIndex((item) =>
      item.emoji === karakter ||
      item.image === karakter,
    ),
  )

  const huidigeAvatar =
    avatarKeuses[avatarIndex] ??
    avatarKeuses[0]

  const transitionClass =
    transitionPhase === 'exit-forward'
      ? styles.trekUitVoor
      : transitionPhase === 'enter-forward'
        ? styles.trekInVoor
        : transitionPhase === 'exit-back'
          ? styles.trekUitTerug
          : transitionPhase === 'enter-back'
            ? styles.trekInTerug
            : ''

  const wysVasteNavigasie =
    stap >= 2 &&
    !successState &&
    !showInlineLoader

  useLayoutEffect(() => {
    if (
      !returnTransition ||
      loading ||
      profileLoading
    ) return

    const logo = logoRef.current
    const sharedLogo = document.querySelector<HTMLImageElement>(
      '[data-shared-logo-transition="reverse"]',
    )

    if (logo && sharedLogo) {
      if (sharedLogo.dataset.sharedLogoAnimating === 'true') {
        logo.style.visibility = 'hidden'
        return
      }

      sharedLogo.dataset.sharedLogoAnimating = 'true'
      const source = sharedLogo.getBoundingClientRect()
      const target = logo.getBoundingClientRect()
      const sourceScale = Math.min(
        source.width / Math.max(target.width, 1),
        source.height / Math.max(target.height, 1),
      )

      logo.style.visibility = 'hidden'

      const animation = sharedLogo.animate(
        [
          { translate: '0 0', scale: '1' },
          {
            translate: `${target.left + target.width / 2 - (source.left + source.width / 2)}px ${target.top + target.height / 2 - (source.top + source.height / 2)}px`,
            scale: `${1 / Math.max(sourceScale, .001)}`,
          },
        ],
        {
          duration: 1080,
          easing: 'cubic-bezier(.16, 1, .3, 1)',
          fill: 'both',
        },
      )

      animation.onfinish = () => {
        logo.style.visibility = 'visible'
        sharedLogo.remove()
      }

      /* Do not tear down the shared element here. React Strict Mode replays
         layout effects in development; removing it during that replay turns
         the reverse handoff into an instant jump. The finished animation owns
         the visual handoff and removes the element itself. */
      return
    }

    const sourceLeft = state?.returnLogoLeft
    const sourceTop = state?.returnLogoTop
    const sourceWidth = state?.returnLogoWidth
    const sourceHeight = state?.returnLogoHeight

    if (
      !logo ||
      sourceLeft === undefined ||
      sourceTop === undefined ||
      sourceWidth === undefined ||
      sourceHeight === undefined
    ) {
      return
    }

    const target = logo.getBoundingClientRect()
    const sourceCenterX = sourceLeft + sourceWidth / 2
    const sourceCenterY = sourceTop + sourceHeight / 2
    const targetCenterX = target.left + target.width / 2
    const targetCenterY = target.top + target.height / 2
    const sourceScale = Math.min(
      sourceWidth / Math.max(target.width, 1),
      sourceHeight / Math.max(target.height, 1),
    )

    const animation = logo.animate(
      [
        {
          opacity: 1,
          translate: `${sourceCenterX - targetCenterX}px ${sourceCenterY - targetCenterY}px`,
          scale: `${sourceScale}`,
        },
        {
          opacity: 1,
          translate: '0 0',
          scale: '1',
        },
      ],
      {
        duration: 1080,
        easing: 'cubic-bezier(.16, 1, .3, 1)',
        fill: 'both',
      },
    )

    animation.onfinish = () => animation.cancel()

    return () => {
      animation.onfinish = null
      animation.cancel()
    }
  }, [
    loading,
    profileLoading,
    returnTransition,
    state?.returnLogoHeight,
    state?.returnLogoLeft,
    state?.returnLogoTop,
    state?.returnLogoWidth,
  ])

  useEffect(() => {
    if (
      !returnTransition ||
      loading ||
      profileLoading
    ) return

    window.sessionStorage.removeItem(
      'lente-return-onboarding',
    )

    const timer = window.setTimeout(
      () => {
        setReturnTransition(false)
      },
      1550,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [loading, profileLoading, returnTransition])

  useEffect(() => {
    contentScrollRef.current?.scrollTo({
      top: 0,
      behavior: 'auto',
    })
  }, [stap])

  useEffect(() => {
    if (!profile) return

    setUsername(
      profile.username.replace(/^@/, ''),
    )

    setKarakter(profile.character)
  }, [profile])

  useEffect(() => {
    if (stap !== 3) return

    if (skoonUsername.length < 3) {
      setUsernameStatus(
        skoonUsername.length === 0
          ? 'idle'
          : 'invalid',
      )

      return
    }

    setUsernameStatus('checking')

    let cancelled = false

    const timer = window.setTimeout(
      async () => {
        const status =
          await checkUsernameAvailability(
            skoonUsername,
          )

        if (!cancelled) {
          setUsernameStatus(status)
        }
      },
      400,
    )

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    stap,
    skoonUsername,
    checkUsernameAvailability,
  ])

  useEffect(() => {
    if (!profileLoading || !user) {
      setShowInlineLoader(false)
      return
    }

    const timer = window.setTimeout(
      () => {
        setShowInlineLoader(true)
      },
      450,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    profileLoading,
    user,
  ])

  const wisselStap = async (
    volgendeStap: OnboardingStap,
    success?: SuccessState,
  ) => {
    if (isTransitioning) return

    setIsTransitioning(true)

    const vorentoe =
      volgendeStap > stap

    if (success) {
      setSuccessState(success)
      setTransitionPhase('success')

      await wag(1900)
    }

    setTransitionPhase(
      vorentoe
        ? 'exit-forward'
        : 'exit-back',
    )

    // Keep the state swap aligned with the CSS exit motion so there is no
    // empty beat before the next step starts entering.
    await wag(440)

    setStap(volgendeStap)

    if (volgendeStap > hoogsteStap) {
      setHoogsteStap(volgendeStap)
    }

    setSuccessState(null)

    setTransitionPhase(
      vorentoe
        ? 'enter-forward'
        : 'enter-back',
    )

    await wag(620)

    setTransitionPhase('idle')
    setIsTransitioning(false)
  }

  const skuifAvatar = (
    rigting: -1 | 1,
  ) => {
    if (!avatarKeuses.length) return

    const volgendeIndex =
      (
        avatarIndex +
        rigting +
        avatarKeuses.length
      ) % avatarKeuses.length

    const volgende =
      avatarKeuses[volgendeIndex]

    setAvatarDirection(rigting)
    setAvatarAnimation((current) => current + 1)

    setKarakter(
      volgende.emoji,
    )
  }

  const animeerNaTuis = async () => {
    if (authReturnPath !== '/') {
      window.sessionStorage.removeItem('lente-auth-return')
      navigate(authReturnPath, { replace: true })
      return
    }
    if (
      window.innerWidth <= 680 &&
      window.scrollY > 0
    ) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      await wag(360)
    }

    const skepGedeeldeMerkDeel = (
      element: HTMLImageElement | null,
      deel: 'mouth' | 'logo',
    ) => {
      const bounds = element?.getBoundingClientRect()
      if (!bounds || !element) return

      const clone = element.cloneNode(true) as HTMLImageElement
      clone.dataset.sharedBrandPiece = deel
      if (deel === 'logo') {
        clone.dataset.sharedLogoTransition = 'forward'
      }
      clone.setAttribute('aria-hidden', 'true')
      clone.style.cssText = [
        'position:fixed',
        `z-index:${deel === 'mouth' ? '9999' : '9998'}`,
        `left:${bounds.left}px`,
        `top:${bounds.top}px`,
        `width:${bounds.width}px`,
        `height:${bounds.height}px`,
        'max-width:none',
        'max-height:none',
        'object-fit:contain',
        'transform-origin:center center',
        'transform:translate3d(0,0,0) scale(1)',
        'visibility:visible',
        'will-change:transform',
        'pointer-events:none',
      ].join(';')
      document.body.appendChild(clone)
      element.style.visibility = 'hidden'
    }

    skepGedeeldeMerkDeel(mouthRef.current, 'mouth')
    skepGedeeldeMerkDeel(logoRef.current, 'logo')

    setIsTransitioning(true)
    setHomeTransition(true)

    await Promise.all([
      wag(360),
      homeChunkPromiseRef.current?.catch(() => undefined),
    ])

    navigate(
      '/',
      {
        replace: true,
        state: {
          onboardingReveal: true,
        },
      },
    )
  }

  const klaar = async () => {
    if (
      saving ||
      !usernameGeldig ||
      isTransitioning
    ) {
      return
    }

    setSaving(true)

    const ok = await saveProfile({
      username: skoonUsername,
      character: karakter,
    })

    setSaving(false)

    if (!ok) return

    await animeerNaTuis()
  }

  const hanteerLinkerKnop = () => {
    void wisselStap(
      stap === 3 ? 2 : 1,
    )
  }

  const hanteerRegterKnop = () => {
    if (stap === 2) {
      void wisselStap(3)
      return
    }

    void klaar()
  }

  if (phase === 'post') {
    return <Navigate to="/" replace />
  }

  if (
    loading ||
    (profileLoading && !user)
  ) {
    return <PageLoader />
  }

  return (
    <main
      className={[
        styles.blad,
        homeTransition
          ? styles.homeTransition
          : '',
        returnTransition
          ? styles.returnTransition
          : '',
        stap === 1
          ? styles.mobieleStapEenBlad
          : stap === 2
            ? styles.mobieleStapTweeBlad
            : styles.mobieleStapDrieBlad,
        // Centring step 1's tracker badge only makes sense while it's the
        // only one revealed. Once you've been further and come back via
        // "Back", steps 2/3 are visible too, so step 1 belongs back on the
        // left like a normal row -- not re-centred over them.
        hoogsteStap === 1
          ? styles.mobieleEersteBesoek
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <TopBar />

      <div className={styles.uitleg}>
        <header className={styles.merkArea}>
          <img
            ref={mouthRef}
            className={styles.mondElement}
            src={mouthElement}
            alt=""
            aria-hidden="true"
          />

          <img
            ref={logoRef}
            className={styles.lingoLogo}
            src={lekeLenteLingoLogo}
            alt="Leke Lente Lingo"
            style={logoTransitionVars}
          />
        </header>

        <section
          className={styles.bladPaneel}
          aria-label="Lente Book onboarding"
        >
          <div
            className={styles.paneelHandvatsel}
            aria-hidden="true"
          />

          <div
            className={`${styles.paneelBinne} ${stap === 1 ? styles.mobieleEersteStap : stap === 2 ? styles.mobieleReelsStap : styles.mobieleProfielStap}`}
          >
            <div
              className={styles.vordering}
              aria-label={`Step ${stap} of 3`}
              style={{
                '--spark-outline-url': `url(${sparkPinkOutline})`,
                '--spark-filled-url': `url(${sparkPinkFilled})`,
              } as StapTrackerVars}
            >
              {STAPPE.map((item) => {
                const aktief =
                  stap === item.n

                const voltooi =
                  stap > item.n

                const onthul =
                  item.n <= hoogsteStap

                return (
                  <div
                    key={item.n}
                    className={[
                      styles.vorderStap,
                      item.n === 1
                        ? styles.trackerBegin
                        : onthul
                          ? styles.trackerOnthul
                          : styles.trackerVersteek,
                      aktief
                        ? styles.aktief
                        : '',
                      voltooi
                        ? styles.voltooi
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={
                      aktief
                        ? 'step'
                        : undefined
                    }
                    aria-hidden={!onthul}
                  >
                    {item.n > 1 && (
                      <span
                        className={`${styles.vorderVerbinding} ${stap >= item.n ? styles.vorderVerbindingVoltooi : ''}`}
                        aria-hidden="true"
                      />
                    )}

                    <span
                      className={styles.vorderSirkel}
                    >
                      {voltooi
                        ? '✓'
                        : item.n}
                    </span>

                    <small
                      className={styles.vorderNaam}
                      aria-label={item.titel}
                    >
                      <span
                        className={styles.vorderNaamPlat}
                        aria-hidden="true"
                      >
                        {item.titel}
                      </span>

                      <svg
                        className={styles.vorderNaamBoog}
                        viewBox="0 0 132 56"
                        aria-hidden="true"
                      >
                        <defs>
                          <path
                            id={`stap-boog-${item.n}`}
                            d="M 24 7 C 24 34 42 49 66 49 C 90 49 108 34 108 7"
                          />
                        </defs>
                        <text>
                          <textPath
                            href={`#stap-boog-${item.n}`}
                            startOffset="50%"
                            textAnchor="middle"
                          >
                            {item.titel}
                          </textPath>
                        </text>
                      </svg>
                    </small>
                  </div>
                )
              })}
            </div>

            {stap !== 1 && (
              <div className={styles.mobieleStapOpskrif} key={`mobile-step-${stap}`}>
                <p>{STAPPE[stap - 1].beskrywing}</p>
              </div>
            )}

            <div className={styles.stapVenster}>
              <div
                ref={contentScrollRef}
                className={[
                  styles.stapInhoud,
                  transitionClass,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {successState ? (
                  <div
                    className={styles.successState}
                    aria-live="polite"
                  >
                    <div
                      className={
                        styles.successAnimation
                      }
                      aria-hidden="true"
                    >
                      <span>✓</span>
                    </div>

                    <h2
                      className={styles.successTitel}
                    >
                      Success
                    </h2>
                  </div>
                ) : showInlineLoader && user ? (
                  <div
                    className={styles.inlineLoading}
                    aria-live="polite"
                  >
                    <div
                      className={styles.inlineSpinner}
                      aria-hidden="true"
                    >
                      <span />
                      <span />
                      <span />
                    </div>

                    <p>
                      Ons kry jou profiel gereed…
                    </p>
                  </div>
                ) : (
                  <>
                    {stap === 1 && (
                      profile?.onboardingComplete ? (
                        <div
                          className={styles.loginStap}
                        >
                          <h1
                            className={styles.paneelTitel}
                          >
                            Welkom terug.
                          </h1>

                          <p
                            className={
                              styles.paneelBeskrywing
                            }
                          >
                            Gaan voort met jou
                            profiel, of begin oor
                            met nuwe besonderhede.
                          </p>

                          <div className={styles.terugProfielKaart}>
                            <div
                              className={styles.welkomTerugAvatar}
                              style={{
                                background:
                                  huidigeAvatar?.kleur ??
                                  '#f8e42b',
                              }}
                            >
                              {huidigeAvatar?.image && (
                                <img
                                  src={huidigeAvatar.image}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                />
                              )}
                            </div>

                            <div className={styles.terugProfielTekst}>
                              <strong>
                                {profile.username}
                              </strong>
                              <span>
                                Hierdie toestel onthou jou
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`${styles.aanmeldKnop} ${styles.hoofKnop} ${styles.terugProfielAksie}`}
                              onClick={() =>
                                void animeerNaTuis()
                              }
                              disabled={
                                isTransitioning
                              }
                            >
                              Gaan voort
                            </button>
                          </div>

                        </div>
                      ) : (
                        <div
                          className={styles.loginStap}
                        >
                          <h1
                            className={styles.paneelTitel}
                          >
                            Welkom by Lente Book.
                          </h1>

                          <p
                            className={
                              styles.paneelBeskrywing
                            }
                          >
                            Skep woorde, gee jou
                            gunstelinge ’n stem en
                            versamel jou posters,
                            kies net ’n
                            gebruikersnaam om te
                            begin.
                          </p>

                          <div
                            className={styles.loginAksies}
                          >
                            <button
                              type="button"
                              className={`${styles.aanmeldKnop} ${styles.hoofKnop}`}
                              onClick={() =>
                                void wisselStap(2)
                              }
                              disabled={
                                isTransitioning
                              }
                            >
                              Volgende
                            </button>

                          </div>

                          {authError && (
                            <p className={styles.fout}>
                              {authError}
                            </p>
                          )}
                        </div>
                      )
                    )}

                    {stap === 2 && (
                      <div
                        className={styles.reelsStap}
                      >
                        <h1
                          className={styles.paneelTitel}
                        >
                          Só werk die boek.
                        </h1>

                        <p className={`${styles.paneelBeskrywing} ${styles.desktopStapBeskrywing}`}>
                          Vind, skep, gee stemme en versamel jou feeswoorde.
                        </p>

                        <ol
                          className={styles.reelsLys}
                        >
                          {REELS.map((reel) => (
                            <li key={reel.n}>
                              <div>
                                <strong className={styles.reelTitelRy}>
                                  <span
                                    className={
                                      styles.reelNommer
                                    }
                                  >
                                    {reel.n}
                                  </span>

                                  {reel.titel}
                                </strong>

                                <p>
                                  {reel.beskrywing}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {stap === 3 && (
                      <div
                        className={styles.profielStap}
                      >
                        <h1
                          className={styles.paneelTitel}
                        >
                          Bou jou profiel.
                        </h1>

                        <p className={`${styles.paneelBeskrywing} ${styles.desktopStapBeskrywing}`}>
                          Kies jou avatar en maak jou unieke gebruikersnaam.
                        </p>

                        <div
                          className={styles.profielTag}
                        >
                          <div
                            className={
                              styles.avatarRedigeerder
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.avatarPyltjie
                              }
                              aria-label="Previous profile picture"
                              onClick={() =>
                                skuifAvatar(-1)
                              }
                            >
                              ‹
                            </button>

                            <div
                              className={
                                styles.avatarVoorskou
                              }
                            >
                              <div
                                className={
                                  styles.avatarSirkel
                                }
                                style={{
                                  background:
                                    huidigeAvatar?.kleur ??
                                    '#f8e42b',
                                }}
                              >
                                <div
                                  key={`${huidigeAvatar?.id}-${avatarAnimation}`}
                                  className={`${styles.avatarSlide} ${avatarDirection > 0 ? styles.avatarSlideNext : styles.avatarSlidePrevious}`}
                                >
                                  {huidigeAvatar?.image && (
                                    <img
                                      src={huidigeAvatar.image}
                                      alt="Your profile"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                </div>
                              </div>

                              <small>
                                {huidigeAvatar?.naam}
                              </small>
                            </div>

                            <button
                              type="button"
                              className={
                                styles.avatarPyltjie
                              }
                              aria-label="Next profile picture"
                              onClick={() =>
                                skuifAvatar(1)
                              }
                            >
                              ›
                            </button>
                          </div>

                          <div
                            className={styles.profielVelde}
                          >
                            <label
                              className={styles.etiket}
                              htmlFor="username"
                            >
                              Jou gebruikersnaam
                            </label>

                            <div
                              className={styles.naamVeld}
                            >
                              <span aria-hidden="true">
                                @
                              </span>

                              <input
                                id="username"
                                name="lente-display-name"
                                type="text"
                                value={username}
                                minLength={3}
                                maxLength={22}
                                pattern="[A-Za-z0-9_]{3,22}"
                                inputMode="text"
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                title="Use letters, numbers, and underscores only."
                                placeholder="toilet_towenaar"
                                onChange={(event) => {
                                  const typedValue =
                                    event.target.value
                                      .replace(/^@/, '')
                                      .split('@')[0]

                                  const nextValue =
                                    typedValue.replace(
                                      /[^a-zA-Z0-9_]/g,
                                      '',
                                    )

                                  setUsername(nextValue)
                                }}
                              />
                            </div>

                            <div
                                className={[
                                  styles.usernameStatus,
                                  usernameStatus ===
                                  'available'
                                    ? styles.statusAvailable
                                    : '',
                                  usernameStatus === 'taken' ||
                                  usernameStatus === 'error'
                                    ? styles.statusTaken
                                    : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                aria-live="polite"
                              >
                                {usernameStatus ===
                                  'checking' &&
                                  'Checking availability…'}

                                {usernameStatus ===
                                  'available' &&
                                  'This name is available.'}

                                {usernameStatus ===
                                  'taken' &&
                                  'That name is already taken.'}

                                {usernameStatus ===
                                  'invalid' &&
                                  'Use at least 3 characters.'}

                                {usernameStatus ===
                                  'error' &&
                                  'Kon nie jou gebruikersnaam nagaan nie. Probeer weer.'}
                            </div>
                          </div>
                        </div>

                        {authError && (
                          <p className={styles.fout}>
                            {authError}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {wysVasteNavigasie && (
                <nav
                  className={styles.vasteNavigasie}
                  aria-label="Onboarding navigation"
                >
                  <div
                    className={
                      styles.vasteNavigasieLinks
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.navSekonder
                      }
                      disabled={
                        isTransitioning ||
                        saving
                      }
                      onClick={
                        hanteerLinkerKnop
                      }
                    >
                      <span
                        key={`left-${stap}`}
                        className={styles.navNaam}
                      >
                        Back
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className={styles.navPrimar}
                    disabled={
                      isTransitioning ||
                      saving ||
                      (
                        stap === 3 &&
                        !usernameGeldig
                      )
                    }
                    onClick={
                      hanteerRegterKnop
                    }
                  >
                    <span
                      key={`right-${stap}-${saving}`}
                      className={styles.navNaam}
                    >
                      {stap === 2
                        ? 'Next'
                        : saving
                          ? 'Saving…'
                          : 'Finished'}
                    </span>
                  </button>
                </nav>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
