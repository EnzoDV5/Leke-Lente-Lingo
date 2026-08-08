import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import lekeLenteLingoLogo from '../../assets/elements/Leke-lente-lingo.webp'
import OnboardingBackground from '../../components/decor/OnboardingBackground'
import TopBar from '../../components/layout/TopBar'
import { useAuth } from '../auth/AuthContext'
import styles from './Onboarding.module.css'

const KARAKTERS = [
  {
    id: 'flower',
    emoji: '🌼',
    naam: 'Blomkop',
    kleur: '#f5c518',
  },
  {
    id: 'frog',
    emoji: '🐸',
    naam: 'Paddapret',
    kleur: '#18d860',
  },
  {
    id: 'cherry',
    emoji: '🍒',
    naam: 'Kersiekind',
    kleur: '#f81878',
  },
  {
    id: 'sun',
    emoji: '🌞',
    naam: 'Sonskyn',
    kleur: '#f2e23e',
  },
  {
    id: 'ghost',
    emoji: '👻',
    naam: 'Feesspook',
    kleur: '#f898c0',
  },
  {
    id: 'alien',
    emoji: '👽',
    naam: 'Lentelien',
    kleur: '#7828b8',
  },
]

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
      'Maak ’n nuwe Afrikaanse woord.',
  },
  {
    n: 3,
    titel: 'Stem',
    beskrywing:
      'Kies jou gunsteling en verbeter woorde.',
  },
  {
    n: 4,
    titel: 'Versamel',
    beskrywing:
      'Bou jou eie Lente Book-versameling.',
  },
]

const STAPPE = [
  {
    n: 1,
    titel: 'Teken aan',
  },
  {
    n: 2,
    titel: 'Die reëls',
  },
  {
    n: 3,
    titel: 'Jou profiel',
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
    clearAuthError,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const state =
    location.state as LocationState | null

  const [stap, setStap] =
    useState<OnboardingStap>(1)

  const [
    hoogsteStap,
    setHoogsteStap,
  ] = useState<OnboardingStap>(1)

  const [username, setUsername] =
    useState('')

  const [karakter, setKarakter] =
    useState('🌼')

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

      ...KARAKTERS.map((item) => ({
        ...item,
        image: null,
        provider: false,
      })),
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
          item.emoji === karakter,
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
    !showInlineLoader

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
      if (!isTransitioning) {
        setHoogsteStap(3)
        setStap(3)
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

    await wag(760)

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

    await wag(820)

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

    setUseGooglePhoto(
      volgende.provider,
    )

    setKarakter(
      volgende.emoji,
    )
  }

  const meldGoogle = async () => {
    clearAuthError()
    setBusy('google')

    const signedInUser =
      await signInWithGoogle()

    if (signedInUser) {
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

    const signedInUser =
      await signInWithApple()

    if (signedInUser) {
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

    await logOut()

    clearAuthError()
    setSuccessState(null)
    setTransitionPhase('idle')
    setUsername('')
    setUsernameStatus('idle')
    setHoogsteStap(1)
    setStap(1)
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

    setIsTransitioning(true)

    setSuccessState({
      title: 'Success',
      text:
        `Welcome to Lente Book, @${skoonUsername}.`,
    })

    setTransitionPhase('success')

    await wag(2100)

    navigate(
      state?.from ?? '/',
      {
        replace: true,
      },
    )
  }

  const hanteerLinkerKnop = () => {
    if (stap === 2) {
      void tekenUit()
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
    return (
      <main className={styles.laai}>
        <OnboardingBackground />

        <span>
          Lente Book groei…
        </span>
      </main>
    )
  }

  return (
    <main className={styles.blad}>
      <OnboardingBackground />

      <TopBar />

      <div className={styles.uitleg}>
        <header className={styles.merkArea}>
          <img
            className={styles.lingoLogo}
            src={lekeLenteLingoLogo}
            alt="Leke Lente Lingo"
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

          <div className={styles.paneelBinne}>
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
                        className={
                          styles.vorderVerbinding
                        }
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

                    <small>
                      {item.titel}
                    </small>
                  </div>
                )
              })}
            </div>

            <div className={styles.stapVenster}>
              <div
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
                      <div
                        className={styles.loginStap}
                      >
                        <p className={styles.oog}>
                          Stap een
                        </p>

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
                        <p className={styles.oog}>
                          Stap twee
                        </p>

                        <h1
                          className={styles.paneelTitel}
                        >
                          Só werk die boek.
                        </h1>

                        <p
                          className={
                            styles.paneelBeskrywing
                          }
                        >
                          Vier eenvoudige stappe.
                          Vind, skep, stem en
                          versamel.
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
                        <p className={styles.oog}>
                          Stap drie
                        </p>

                        <h1
                          className={styles.paneelTitel}
                        >
                          Bou jou profiel.
                        </h1>

                        <p
                          className={
                            styles.paneelBeskrywing
                          }
                        >
                          Kies jou profielprent en
                          maak ’n unieke
                          gebruikersnaam.
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
                                {huidigeAvatar?.image ? (
                                  <img
                                    src={
                                      huidigeAvatar.image
                                    }
                                    alt="Your profile"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : huidigeAvatar?.provider ? (
                                  <span
                                    className={
                                      styles.providerFallback
                                    }
                                  >
                                    {providerIsApple ? (
                                      <AppleGlyph />
                                    ) : (
                                      <span
                                        className={
                                          styles.googleAvatarIcon
                                        }
                                      >
                                        G
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span>
                                    {
                                      huidigeAvatar?.emoji
                                    }
                                  </span>
                                )}
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
                                value={username}
                                maxLength={22}
                                autoComplete="username"
                                placeholder="toilet_towenaar"
                                onChange={(event) => {
                                  const nextValue =
                                    event.target.value
                                      .replace(/^@/, '')
                                      .replace(
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
                        void tekenUit()
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