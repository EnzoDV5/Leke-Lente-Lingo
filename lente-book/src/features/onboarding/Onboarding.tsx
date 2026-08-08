import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import SkyBackground from '../../components/decor/SkyBackground'
import styles from './Onboarding.module.css'

const KARAKTERS = [
  { id: 'flower', emoji: '🌼', naam: 'Blomkop',    kleur: '#f5c518' },
  { id: 'frog',   emoji: '🐸', naam: 'Paddapret',  kleur: '#18d860' },
  { id: 'cherry', emoji: '🍒', naam: 'Kersiekind', kleur: '#f81878' },
  { id: 'sun',    emoji: '🌞', naam: 'Sonskyn',    kleur: '#f2e23e' },
  { id: 'ghost',  emoji: '👻', naam: 'Feesspook',  kleur: '#f898c0' },
  { id: 'alien',  emoji: '👽', naam: 'Lentelien',  kleur: '#7828b8' },
]

const STAPPE = [
  { n: 1, t: 'Vind ’n bord',    b: 'Soek ’n Lente Book-plakkaat by die fees.' },
  { n: 2, t: 'Dink ’n woord',   b: 'Maak ’n splinternuwe Afrikaanse woord.' },
  { n: 3, t: 'Stem & verbeter', b: 'Stem, of steel ’n woord en maak dit beter.' },
  { n: 4, t: 'Bou die boek',    b: 'Jou woorde leef vir altyd in Lente Book.' },
]

type LocationState = { from?: string }

function AppleGlyph() {
  return (
    <svg viewBox="0 0 384 512" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

export default function Onboarding() {
  const {
    user, profile, loading, profileLoading, authError,
    signInWithGoogle, signInWithApple, saveProfile, logOut, clearAuthError,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [username, setUsername] = useState('')
  const [karakter, setKarakter] = useState('🌼')
  const [useGooglePhoto, setUseGooglePhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null)

  useEffect(() => {
    if (!profile) return
    setUsername(profile.username.replace(/^@/, ''))
    setKarakter(profile.character)
    setUseGooglePhoto(profile.useGooglePhoto)
  }, [profile])

  const meldGoogle = async () => {
    clearAuthError(); setBusy('google'); await signInWithGoogle(); setBusy(null)
  }
  const meldApple = async () => {
    clearAuthError(); setBusy('apple'); await signInWithApple(); setBusy(null)
  }

  const klaar = async () => {
    setSaving(true)
    const ok = await saveProfile({ username, character: karakter, useGooglePhoto })
    setSaving(false)
    if (ok) navigate(state?.from ?? '/', { replace: true })
  }

  if (loading || profileLoading) {
    return (
      <main className={styles.laai}>
        <SkyBackground />
        <span>Lente Book groei…</span>
      </main>
    )
  }

  return (
    <main className={styles.blad}>
      <SkyBackground />

      <div className={styles.raam}>
        <section className={styles.introKant}>
          <span className={styles.jaar}>★ Lentedag 2026 ★</span>
          <h1 className={styles.wordmark}>Lente<span>Book</span></h1>
          <p className={styles.intro}>Die lewende woordeboek wat die Lentedag-skare saam skryf.</p>
          <ol className={styles.stappe}>
            {STAPPE.map((s) => (
              <li key={s.n}>
                <span className={styles.stapNo}>{s.n}</span>
                <div><strong>{s.t}</strong><p>{s.b}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.kaartKant}>
          {!user ? (
            <div className={styles.kaart}>
              <p className={styles.oog}>Een tik. Dan is jy in.</p>
              <h2 className={styles.kaartKop}>Kom maak Afrikaans groter.</h2>
              <p className={styles.beskryf}>Meld vinnig aan — geen wagwoorde of lang vorms nie.</p>

              <button className={`${styles.meldKnop} ${styles.google}`} onClick={meldGoogle} disabled={busy !== null}>
                <span className={styles.gIcon}>G</span>
                {busy === 'google' ? 'Wag…' : 'Teken aan met Google'}
              </button>

              <button className={`${styles.meldKnop} ${styles.apple}`} onClick={meldApple} disabled={busy !== null}>
                <AppleGlyph />
                {busy === 'apple' ? 'Wag…' : 'Teken aan met Apple'}
              </button>

              {authError && <p className={styles.fout}>{authError}</p>}
              <small className={styles.klein}>Ons gebruik net jou naam en foto om jou plasings te herken.</small>
            </div>
          ) : (
            <div className={styles.kaart}>
              <p className={styles.oog}>Hallo, {user.displayName?.split(' ')[0] ?? 'Lente-vriend'}!</p>
              <h2 className={styles.kaartKop}>Kies hoe jy in die boek lyk.</h2>

              <label className={styles.etiket} htmlFor="username">Jou gebruikersnaam</label>
              <div className={styles.naamVeld}>
                <span>@</span>
                <input id="username" value={username} maxLength={22}
                  onChange={(e) => setUsername(e.target.value)} placeholder="woordskepper" />
              </div>

              {user.photoURL && (
                <button className={`${styles.googleFoto} ${useGooglePhoto ? styles.gekies : ''}`}
                  onClick={() => setUseGooglePhoto(true)}>
                  <img src={user.photoURL} alt="Google-profiel" />
                  <span>Gebruik my Google-foto</span>
                </button>
              )}

              <div className={styles.ofKies}><span>Of kies ’n karakter</span></div>
              <div className={styles.karakters}>
                {KARAKTERS.map((k) => (
                  <button key={k.id} type="button" title={k.naam} aria-label={k.naam}
                    style={{ background: k.kleur }}
                    className={!useGooglePhoto && karakter === k.emoji ? styles.gekiesK : ''}
                    onClick={() => { setKarakter(k.emoji); setUseGooglePhoto(false) }}>
                    {k.emoji}
                  </button>
                ))}
              </div>

              {authError && <p className={styles.fout}>{authError}</p>}

              <button className={styles.klaarKnop} onClick={klaar} disabled={saving}>
                {saving ? 'Stoor…' : profile ? 'Stoor veranderinge' : 'Klaar! Los my in →'}
              </button>
              <button className={styles.uitKnop} onClick={() => void logOut()}>Teken uit</button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
