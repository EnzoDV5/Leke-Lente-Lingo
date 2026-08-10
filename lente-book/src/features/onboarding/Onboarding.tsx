import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import lekeLenteLingoLogo from '../../assets/elements/Leke-lente-lingo.webp'
import TopBar from '../../components/layout/TopBar'
import PageLoader from '../../components/ui/PageLoader'
import { PROFILE_AVATARS } from '../../lib/profileAvatars'
import { useAuth } from '../auth/AuthContext'
import styles from './Onboarding.module.css'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

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
  provider: false,
}))

const REELS = [
  {
    n: 1,
    titel: 'Vind',
    beskrywing:
      'Scan ’n Lente Book-plakkaat by die fees.',
  },
  {
    n: 2,
    titel: 'Skep',
    beskrywing:
      'Maak ’n nuwe Afrikaanse woord vir die scenario.',
  },
  {
    n: 3,
    titel: 'Stem & versamel',
    beskrywing:
      'Stem vir jou gunstelinge en bou jou versameling.',
  },
]

const STAPPE = [
  {
    n: 1,
    titel: 'Teken aan',
    beskrywing: 'Meld vinnig aan om jou Lente Book-avontuur te begin.',
  },
  {
    n: 2,
    titel: 'Die reëls',
    beskrywing: 'Vind, skep, stem en versamel jou feeswoorde.',
  },
  {
    n: 3,
    titel: 'Jou profiel',
    beskrywing: 'Kies jou avatar en maak jou unieke gebruikersnaam.',
  },
]

type OnboardingStap = 1 | 2 | 3

type AanmeldVerskaffer =
  | 'google'
  | 'apple'
  | null

type UsernameStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'invalid'

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

function wag(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

function AppleGlyph() {
  return (
    <svg
      viewBox="0 0 384 512"
      width="26"
      height="26"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

export default function Onboarding() {
  const {
    user,
    profile,
    loading,
    profileLoading,
    authError,
    signInWithGoogle,
    signInWithApple,
    checkUsernameAvailability,
    saveProfile,
    logOut,
    deleteAccount,
    clearAuthError,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

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

  const [
    useGooglePhoto,
    setUseGooglePhoto,
  ] = useState(false)

  const [busy, setBusy] =
    useState<AanmeldVerskaffer>(null)

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
    showLogoutConfirm,
    setShowLogoutConfirm,
  ] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  useBodyScrollLock(showLogoutConfirm)

  const [
    homeTransition,
    setHomeTransition,
  ] = useState(false)

  const logoRef =
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

  const providerIsApple =
    user?.providerData.some(
      (provider) =>
        provider.providerId === 'apple.com',
    ) ?? false

  const providerInitial = (
    user?.displayName?.trim().charAt(0) ||
    user?.email?.trim().charAt(0) ||
    'L'
  ).toUpperCase()

  const rawProviderPhoto =
    user?.photoURL ??
    user?.providerData.find(
      (provider) =>
        provider.providerId === 'google.com' ||
        provider.providerId === 'apple.com',
    )?.photoURL ??
    null

  const providerPhoto =
    rawProviderPhoto?.replace(
      /=s\d+-c$/,
      '=s256-c',
    ) ?? null

  const avatarKeuses = useMemo(
    () => [
      ...(user
        ? [
            {
              id: 'provider',
              emoji: providerInitial,
              naam: providerIsApple
                ? 'Apple-profiel'
                : 'Google-profiel',
              kleur: '#ffffff',
              image: providerPhoto,
              provider: true,
            },
          ]
        : []),

      ...PROFIEL_FOTOS,
    ],
    [
      user,
      providerInitial,
      providerIsApple,
      providerPhoto,
    ],
  )

  const avatarIndex = Math.max(
    0,
    avatarKeuses.findIndex((item) =>
      item.provider
        ? useGooglePhoto
        : !useGooglePhoto &&
          (item.emoji === karakter ||
            item.image === karakter),
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
    Boolean(user) &&
    stap >= 2 &&
    !successState &&
    !showInlineLoader &&
    !showLogoutConfirm

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
  }, [stap, showLogoutConfirm])

  useEffect(() => {
    if (!profile) return

    setUsername(
      profile.username.replace(/^@/, ''),
    )

    setKarakter(profile.character)

    setUseGooglePhoto(
      profile.useGooglePhoto,
    )
  }, [profile])

  useEffect(() => {
    if (loading || profileLoading) {
      return
    }

    if (!user) {
      if (!isTransitioning) {
        setStap(1)
        setHoogsteStap(1)
      }

      return
    }

    if (profile?.onboardingComplete) {
      if (
        !isTransitioning &&
        busy === null
      ) {
        window.sessionStorage.removeItem('lente-auth-return')
        navigate(
          authReturnPath,
          {
            replace: true,
          },
        )
      }

      return
    }

    if (
      stap === 1 &&
      busy === null &&
      !isTransitioning
    ) {
      setHoogsteStap(2)
      setStap(2)
    }
  }, [
    user,
    profile,
    loading,
    profileLoading,
    stap,
    busy,
    isTransitioning,
    navigate,
    authReturnPath,
  ])

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
        const available =
          await checkUsernameAvailability(
            skoonUsername,
          )

        if (!cancelled) {
          setUsernameStatus(
            available
              ? 'available'
              : 'taken',
          )
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

  useEffect(() => {
    if (!user || profile) {
      return
    }

    setUseGooglePhoto(true)
    setKarakter(providerInitial)
  }, [
    user,
    profile,
    providerInitial,
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

    setUseGooglePhoto(
      volgende.provider,
    )

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

    const logoBounds = logoRef.current?.getBoundingClientRect()

    if (logoBounds && logoRef.current) {
      const sharedLogo = logoRef.current.cloneNode(true) as HTMLImageElement
      sharedLogo.dataset.sharedLogoTransition = 'forward'
      sharedLogo.setAttribute('aria-hidden', 'true')
      sharedLogo.style.cssText = [
        'position:fixed',
        'z-index:9999',
        `left:${logoBounds.left}px`,
        `top:${logoBounds.top}px`,
        `width:${logoBounds.width}px`,
        `height:${logoBounds.height}px`,
        'max-width:none',
        'max-height:none',
        'object-fit:contain',
        'transform-origin:center center',
        'transform:translate3d(0,0,0) scale(1)',
        'visibility:visible',
        'will-change:transform',
        'pointer-events:none',
      ].join(';')
      document.body.appendChild(sharedLogo)
      logoRef.current.style.visibility = 'hidden'
    }

    setIsTransitioning(true)
    setHomeTransition(true)

    await wag(360)

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

  const meldGoogle = async () => {
    clearAuthError()
    setBusy('google')

    const signInResult =
      await signInWithGoogle()

    if (
      signInResult?.profile
        ?.onboardingComplete
    ) {
      setBusy(null)
      await animeerNaTuis()
      return
    }

    if (signInResult) {
      await wisselStap(2, {
        title: 'Success',
        text: 'Your Google profile is connected.',
      })
    }

    setBusy(null)
  }

  const meldApple = async () => {
    clearAuthError()
    setBusy('apple')

    const signInResult =
      await signInWithApple()

    if (
      signInResult?.profile
        ?.onboardingComplete
    ) {
      setBusy(null)
      await animeerNaTuis()
      return
    }

    if (signInResult) {
      await wisselStap(2, {
        title: 'Success',
        text: 'Your Apple profile is connected.',
      })
    }

    setBusy(null)
  }

  const tekenUit = async () => {
    if (isTransitioning || saving) {
      return
    }

    setIsTransitioning(true)
    setTransitionPhase('exit-back')

    await wag(440)
    await logOut()

    clearAuthError()
    setSuccessState(null)
    setShowLogoutConfirm(false)
    setUsername('')
    setUsernameStatus('idle')
    setHoogsteStap(1)
    setStap(1)

    setTransitionPhase('enter-back')
    await wag(620)

    setTransitionPhase('idle')
    setIsTransitioning(false)
  }

  const veeRekeningUit = async () => {
    if (deletingAccount || isTransitioning) return
    setDeletingAccount(true)
    const deleted = await deleteAccount()
    if (deleted) {
      setShowDeleteConfirm(false)
      setShowLogoutConfirm(false)
      navigate('/welkom', { replace: true })
      return
    }
    setDeletingAccount(false)
  }

  const wisselLogoutBevestiging = async (
    wys: boolean,
  ) => {
    if (isTransitioning || saving) {
      return
    }

    setIsTransitioning(true)

    setTransitionPhase(
      wys
        ? 'exit-back'
        : 'exit-forward',
    )

    await wag(440)
    setShowLogoutConfirm(wys)

    setTransitionPhase(
      wys
        ? 'enter-back'
        : 'enter-forward',
    )

    await wag(620)
    setTransitionPhase('idle')
    setIsTransitioning(false)
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
      useGooglePhoto,
    })

    setSaving(false)

    if (!ok) return

    await animeerNaTuis()
  }

  const hanteerLinkerKnop = () => {
    if (stap === 2) {
      void wisselLogoutBevestiging(true)
      return
    }

    void wisselStap(2)
  }

  const hanteerRegterKnop = () => {
    if (stap === 2) {
      void wisselStap(3)
      return
    }

    void klaar()
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
        showLogoutConfirm
          ? styles.mobieleBevestigingBlad
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <TopBar />

      <div className={styles.uitleg}>
        <header className={styles.merkArea}>
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
                {showLogoutConfirm ? (
                  <div
                    className={styles.logoutConfirm}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="logout-confirm-title"
                    aria-describedby="logout-confirm-description"
                  >
                    <div className={styles.logoutConfirmIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10M14.5 8.5 18 12l-3.5 3.5M9 12h9" />
                      </svg>
                    </div>

                    <h2
                      id="logout-confirm-title"
                      className={styles.paneelTitel}
                    >
                      {showDeleteConfirm ? 'Vee alles uit?' : 'Wil jy uitteken?'}
                    </h2>

                    <p
                      id="logout-confirm-description"
                      className={styles.paneelBeskrywing}
                    >
                      {showDeleteConfirm
                        ? 'Jou profiel, woorde, stemme, foto’s en Lente Bingo-vordering word permanent uitgevee.'
                        : 'Jy sal na die Google- en Apple-aanmeldskerm terugkeer.'}
                    </p>

                    <div className={styles.logoutConfirmAksies}>
                      <button
                        type="button"
                        className={styles.navSekonder}
                        disabled={isTransitioning || deletingAccount}
                        onClick={() => {
                          if (showDeleteConfirm) {
                            setShowDeleteConfirm(false)
                          } else {
                            void wisselLogoutBevestiging(false)
                          }
                        }}
                      >
                        {showDeleteConfirm ? 'Terug' : 'Kanselleer'}
                      </button>

                      <button
                        type="button"
                        className={styles.navPrimar}
                        disabled={isTransitioning || deletingAccount}
                        onClick={() => showDeleteConfirm ? void veeRekeningUit() : void tekenUit()}
                      >
                        {showDeleteConfirm
                          ? deletingAccount ? 'Vee tans uit…' : 'Vee permanent uit'
                          : 'Ja, teken uit'}
                      </button>

                      {!showDeleteConfirm && (
                        <button
                          type="button"
                          className={styles.deleteAccountButton}
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          Vee my rekening uit
                        </button>
                      )}
                    </div>
                  </div>
                ) : successState ? (
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
                          Teken vinnig aan om
                          woorde te maak, te stem
                          en jou plakkate te
                          versamel.
                        </p>

                        <div
                          className={styles.loginAksies}
                        >
                          <button
                            type="button"
                            className={`${styles.aanmeldKnop} ${styles.googleKnop}`}
                            onClick={() =>
                              void meldGoogle()
                            }
                            disabled={
                              busy !== null ||
                              isTransitioning
                            }
                          >
                            <span
                              className={styles.googleG}
                              aria-hidden="true"
                            >
                              G
                            </span>

                            {busy === 'google'
                              ? 'Please wait…'
                              : 'Google'}
                          </button>

                          <button
                            type="button"
                            className={`${styles.aanmeldKnop} ${styles.appleKnop}`}
                            onClick={() =>
                              void meldApple()
                            }
                            disabled={
                              busy !== null ||
                              isTransitioning
                            }
                          >
                            <AppleGlyph />

                            {busy === 'apple'
                              ? 'Please wait…'
                              : 'Apple'}
                          </button>
                        </div>

                        {authError && (
                          <p className={styles.fout}>
                            {authError}
                          </p>
                        )}

                        <small
                          className={styles.privaatheid}
                        >
                          Geen wagwoord of lang
                          vorm nie. Ons gebruik
                          net jou naam en foto om
                          jou plasings te herken.
                        </small>
                      </div>
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
                          Vind, skep, stem en versamel jou feeswoorde.
                        </p>

                        <ol
                          className={styles.reelsLys}
                        >
                          {REELS.map((reel) => (
                            <li key={reel.n}>
                              <span
                                className={
                                  styles.reelNommer
                                }
                              >
                                {reel.n}
                              </span>

                              <div>
                                <strong>
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
                                  className={`${styles.avatarSlide} ${avatarDirection > 0 ? styles.avatarSlideNext : styles.avatarSlidePrevious} ${['profile-22', 'profile-23', 'profile-24'].includes(huidigeAvatar?.id ?? '') ? styles.avatarCompact : ''}`}
                                >
                                  {huidigeAvatar?.image ? (
                                    <img
                                      src={huidigeAvatar.image}
                                      alt="Your profile"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : huidigeAvatar?.provider ? (
                                    <span className={styles.providerFallback}>
                                      {providerIsApple ? (
                                        <AppleGlyph />
                                      ) : (
                                        <span className={styles.googleAvatarIcon}>G</span>
                                      )}
                                    </span>
                                  ) : null}
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

                            {usernameStatus !==
                              'idle' && (
                              <div
                                className={[
                                  styles.usernameStatus,
                                  usernameStatus ===
                                  'available'
                                    ? styles.statusAvailable
                                    : '',
                                  usernameStatus ===
                                  'taken'
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
                              </div>
                            )}
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
                        {stap === 2
                          ? 'Sign Out'
                          : 'Back'}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={[
                        styles.navTeks,
                        stap === 2
                          ? styles.navTeksVersteek
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={
                        isTransitioning ||
                        saving ||
                        stap === 2
                      }
                      onClick={() =>
                        void wisselLogoutBevestiging(true)
                      }
                    >
                      <span className={styles.navNaam}>
                        Sign Out
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
