import {
  useEffect,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import styles from './Onboarding.module.css'

const characters = [
  {
    id: 'flower',
    emoji: '🌼',
    name: 'Blomkop',
    colour: '#f5c518',
  },
  {
    id: 'frog',
    emoji: '🐸',
    name: 'Paddapret',
    colour: '#18d860',
  },
  {
    id: 'cherry',
    emoji: '🍒',
    name: 'Kersiekind',
    colour: '#f81878',
  },
  {
    id: 'sun',
    emoji: '🌞',
    name: 'Sonskyn',
    colour: '#f2e23e',
  },
  {
    id: 'ghost',
    emoji: '👻',
    name: 'Feesspook',
    colour: '#f898c0',
  },
  {
    id: 'alien',
    emoji: '👽',
    name: 'Lentelien',
    colour: '#7828b8',
  },
]

const steps = [
  {
    number: 1,
    title: 'Vind ’n bord',
    text: 'Vind ’n Lente Book-bord of plakkaat by die fees.',
  },
  {
    number: 2,
    title: 'Dink ’n woord',
    text: 'Maak ’n nuwe Afrikaanse woord vir die oomblik.',
  },
  {
    number: 3,
    title: 'Stem & verbeter',
    text: 'Stem vir ’n woord of steel dit en maak dit beter.',
  },
  {
    number: 4,
    title: 'Bou die boek',
    text: 'Jou woorde en foto’s word deel van Lente Book.',
  },
]

type LocationState = {
  from?: string
}

export default function Onboarding() {
  const {
    user,
    profile,
    loading,
    profileLoading,
    authError,
    signInWithGoogle,
    saveProfile,
    logOut,
    clearAuthError,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const state =
    location.state as LocationState | null

  const [username, setUsername] =
    useState('')

  const [character, setCharacter] =
    useState('🌼')

  const [
    useGooglePhoto,
    setUseGooglePhoto,
  ] = useState(false)

  const [saving, setSaving] =
    useState(false)

  useEffect(() => {
    if (!profile) return

    setUsername(
      profile.username.replace(/^@/, ''),
    )

    setCharacter(profile.character)

    setUseGooglePhoto(
      profile.useGooglePhoto,
    )
  }, [profile])

  const handleGoogleLogin = async () => {
    clearAuthError()
    await signInWithGoogle()
  }

  const handleFinish = async () => {
    setSaving(true)

    const saved = await saveProfile({
      username,
      character,
      useGooglePhoto,
    })

    setSaving(false)

    if (saved) {
      navigate(state?.from ?? '/', {
        replace: true,
      })
    }
  }

  if (loading || profileLoading) {
    return (
      <main className={styles.loading}>
        Lente Book groei...
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <section className={styles.stepsSide}>
        <div className={styles.stepsInner}>
          <span className={styles.year}>
            Lentedag 2026
          </span>

          <h1>
            Welkom by
            <br />

            <span>Lente Book</span>
          </h1>

          <p className={styles.introduction}>
            Die lewende woordeboek wat deur
            die Lentedag-skare geskryf word.
          </p>

          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.number}>
                <span
                  className={styles.stepNumber}
                >
                  {step.number}
                </span>

                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.formSide}>
        {!user ? (
          <div className={styles.card}>
            <p className={styles.eyebrow}>
              Een klik. Dan is jy in.
            </p>

            <h2>
              Kom maak
              <br />
              Afrikaans groter.
            </h2>

            <p className={styles.description}>
              Meld vinnig met Google aan.
              Geen wagwoord of lang vorms nie.
            </p>

            <button
              className={styles.googleButton}
              onClick={handleGoogleLogin}
            >
              <span>G</span>
              Teken aan met Google
            </button>

            {authError && (
              <p className={styles.error}>
                {authError}
              </p>
            )}

            <small>
              Ons gebruik jou naam en
              profielfoto om jou plasings te
              herken.
            </small>
          </div>
        ) : (
          <div className={styles.card}>
            <p className={styles.eyebrow}>
              Hallo,{' '}
              {user.displayName?.split(' ')[0] ??
                'Lente-vriend'}
              !
            </p>

            <h2>
              Kies hoe jy
              <br />
              in die boek lyk.
            </h2>

            <label
              className={styles.label}
              htmlFor="username"
            >
              Jou gebruikersnaam
            </label>

            <div
              className={styles.usernameField}
            >
              <span>@</span>

              <input
                id="username"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                placeholder="woordskepper"
                maxLength={22}
              />
            </div>

            {user.photoURL && (
              <button
                className={`${styles.googlePhoto} ${
                  useGooglePhoto
                    ? styles.selectedPhoto
                    : ''
                }`}
                onClick={() =>
                  setUseGooglePhoto(true)
                }
              >
                <img
                  src={user.photoURL}
                  alt="Jou Google-profiel"
                />

                <span>
                  Gebruik my Google-foto
                </span>
              </button>
            )}

            <div
              className={styles.characterHeading}
            >
              <span>
                Of kies ’n karakter
              </span>
            </div>

            <div className={styles.characters}>
              {characters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.name}
                  aria-label={item.name}
                  style={{
                    background:
                      item.colour,
                  }}
                  className={
                    !useGooglePhoto &&
                    character === item.emoji
                      ? styles.selectedCharacter
                      : ''
                  }
                  onClick={() => {
                    setCharacter(item.emoji)
                    setUseGooglePhoto(false)
                  }}
                >
                  {item.emoji}
                </button>
              ))}
            </div>

            {authError && (
              <p className={styles.error}>
                {authError}
              </p>
            )}

            <button
              className={styles.finishButton}
              onClick={handleFinish}
              disabled={saving}
            >
              {saving
                ? 'Stoor...'
                : profile
                  ? 'Stoor veranderinge'
                  : 'Klaar! Los my in →'}
            </button>

            <button
              className={styles.logoutButton}
              onClick={() => void logOut()}
            >
              Teken uit
            </button>
          </div>
        )}
      </section>
    </main>
  )
}