import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import {
  auth,
  authReady,
  db,
} from '../../lib/firebase'

export type LenteProfile = {
  uid: string
  username: string
  character: string
  onboardingComplete: boolean
}

type SaveProfileInput = {
  username: string
  character: string
}

type AuthContextValue = {
  user: User | null
  profile: LenteProfile | null
  loading: boolean
  profileLoading: boolean
  authError: string

  checkUsernameAvailability: (
    username: string,
  ) => Promise<'available' | 'taken' | 'error'>

  saveProfile: (
    details: SaveProfileInput,
  ) => Promise<boolean>

  clearAuthError: () => void
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined)

let anonymousSignInPromise:
  | Promise<User>
  | null = null

function requestPersistentDeviceStorage() {
  if (!navigator.storage?.persist) return

  void navigator.storage.persist().catch(() => {
    // The Firebase session still uses local persistence when unsupported.
  })
}

function normaliseUsername(
  value: string,
) {
  return value
    .trim()
    .replace(/^@/, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
}

function friendlyError(
  error: unknown,
): string {
  if (!(error instanceof Error)) {
    return 'Iets het verkeerd geloop.'
  }

  if (
    error.message.includes(
      'auth/unauthorized-domain',
    )
  ) {
    return 'Hierdie domein is nog nie in Firebase toegelaat nie.'
  }

  if (
    error.message.includes(
      'auth/web-storage-unsupported',
    )
  ) {
    return 'Jou blaaier blokkeer die berging wat nodig is om aan te meld. Skakel privaat blaai af en probeer weer.'
  }

  if (error.message.includes('auth/too-many-requests')) {
    return 'Te veel pogings. Probeer weer oor ’n rukkie.'
  }

  return 'Iets het verkeerd geloop. Probeer weer.'
}

function isRecoverableAuthSessionError(
  error: unknown,
) {
  if (!(error instanceof Error)) return false

  return [
    'auth/invalid-user-token',
    'auth/user-token-expired',
    'auth/user-disabled',
    'auth/user-not-found',
  ].some((code) => error.message.includes(code))
}

async function getOrCreateAnonymousUser() {
  await authReady

  if (auth.currentUser) {
    return auth.currentUser
  }

  const createOnce = async () => {
    if (auth.currentUser) {
      return auth.currentUser
    }

    const credential = await signInAnonymously(auth)
    return credential.user
  }

  anonymousSignInPromise ??= (
    navigator.locks
      ? navigator.locks.request(
          'lente-anonymous-auth-bootstrap',
          createOnce,
        )
      : createOnce()
  )
    .finally(() => {
      anonymousSignInPromise = null
    })

  return anonymousSignInPromise
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null)

  const [profile, setProfile] =
    useState<LenteProfile | null>(null)

  const profileRef =
    useRef<LenteProfile | null>(null)

  const profileSaveInProgressRef =
    useRef(false)

  const [loading, setLoading] =
    useState(true)

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true)

  const [authError, setAuthError] =
    useState('')

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const loadProfile = async (
    firebaseUser: User,
  ): Promise<LenteProfile | null> => {
    setProfileLoading(true)

    // The first anonymous auth event can arrive just before the onboarding
    // profile transaction finishes. Do not let that temporary empty read
    // overwrite the profile that is currently being created.
    if (profileSaveInProgressRef.current) {
      setProfileLoading(false)
      return profileRef.current
    }

    try {
      const profileReference = doc(
        db,
        'users',
        firebaseUser.uid,
      )

      const snapshot =
        await getDoc(profileReference)

      if (snapshot.exists()) {
        const loadedProfile =
          snapshot.data() as LenteProfile

        setProfile(loadedProfile)
        requestPersistentDeviceStorage()
        return loadedProfile
      } else {
        setProfile(null)
        return null
      }
    } catch (error) {
      console.error(
        'Could not load profile:',
        error,
      )

      setProfile(null)
      return null
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    let unsubscribe:
      | (() => void)
      | undefined

    let cancelled = false

    authReady
      .then(() => {
        if (cancelled) return

        unsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
          if (!firebaseUser) {
            // Opening or refreshing onboarding must not create an account.
            // The anonymous UID is created when Finished saves the profile.
            setUser(null)
            setProfile(null)
            setLoading(false)
            setProfileLoading(false)
            setAuthError('')
            return
          }

          setUser(firebaseUser)
          setLoading(false)

          await loadProfile(firebaseUser)
          },
          async (error) => {
          console.error(
            'Authentication error:',
            error,
          )

          if (isRecoverableAuthSessionError(error)) {
            setUser(auth.currentUser)
            setLoading(false)
            setProfileLoading(false)
            setAuthError(
              profileRef.current
                ? 'Jou profieldata is nog veilig. Ons sal nie outomaties ’n nuwe rekening skep en jou UID vervang nie.'
                : 'Jou vorige sessie kon nie herstel word nie. Ons sal nie stilweg ’n nuwe UID skep nie.',
            )
            return
          }

          setAuthError(
            'Ons kon nie jou aanmeldstatus nagaan nie.',
          )

          setUser(null)
          setProfile(null)
          setLoading(false)
          setProfileLoading(false)
          },
        )
      })
      .catch((error) => {
        if (cancelled) return
        setAuthError(friendlyError(error))
        setUser(null)
        setProfile(null)
        setLoading(false)
        setProfileLoading(false)
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const checkUsernameAvailability =
    async (
      username: string,
    ): Promise<'available' | 'taken' | 'error'> => {
      let activeUser = user

      const cleanUsername =
        normaliseUsername(username)

      if (cleanUsername.length < 3) {
        return 'taken'
      }

      if (!activeUser) {
        // The transaction in saveProfile performs the authoritative check
        // after Finished creates the anonymous account.
        return 'available'
      }

      try {
        const usernameReference = doc(
          db,
          'usernames',
          cleanUsername,
        )

        const usernameSnapshot =
          await getDoc(
            usernameReference,
          )

        if (
          !usernameSnapshot.exists()
        ) {
          return 'available'
        }

        return usernameSnapshot.data().uid ===
          activeUser.uid
          ? 'available'
          : 'taken'
      } catch (error) {
        console.error(
          'Username check failed:',
          error,
        )

        return 'error'
      }
    }

  const saveProfile = async (
    details: SaveProfileInput,
  ): Promise<boolean> => {
    let activeUser = user

    if (!activeUser) {
      // The background anonymous sign-in on load may have failed (e.g. a
      // transient network hiccup). Give it one more try right here instead
      // of leaving people stuck with no way forward but a page refresh.
      try {
        profileSaveInProgressRef.current = true
        activeUser =
          await getOrCreateAnonymousUser()
        setUser(activeUser)
      } catch (error) {
        console.error(
          'Anonymous sign-in retry failed:',
          error,
        )

        setAuthError(
          friendlyError(error),
        )
        profileSaveInProgressRef.current = false

        return false
      }
    }

    const cleanUsername =
      normaliseUsername(
        details.username,
      )

    if (cleanUsername.length < 3) {
      setAuthError(
        'Jou gebruikersnaam moet minstens 3 karakters hê.',
      )
      profileSaveInProgressRef.current = false

      return false
    }

    const userReference = doc(
      db,
      'users',
      activeUser.uid,
    )

    const usernameReference = doc(
      db,
      'usernames',
      cleanUsername,
    )

    const newProfile: LenteProfile = {
      uid: activeUser.uid,
      username: `@${cleanUsername}`,
      character:
        details.character,
      onboardingComplete: true,
    }

    try {
      await runTransaction(
        db,
        async (transaction) => {
          const currentProfileSnapshot =
            await transaction.get(
              userReference,
            )

          const newUsernameSnapshot =
            await transaction.get(
              usernameReference,
            )

          if (
            newUsernameSnapshot.exists() &&
            newUsernameSnapshot
              .data()
              .uid !== activeUser.uid
          ) {
            throw new Error(
              'USERNAME_TAKEN',
            )
          }

          const oldUsername =
            currentProfileSnapshot.exists()
              ? String(
                  currentProfileSnapshot
                    .data()
                    .username ?? '',
                )
                  .replace(/^@/, '')
                  .toLowerCase()
              : ''

          let oldUsernameReference =
            usernameReference

          let deleteOldUsername = false

          if (
            oldUsername &&
            oldUsername !==
              cleanUsername
          ) {
            oldUsernameReference = doc(
              db,
              'usernames',
              oldUsername,
            )

            const oldUsernameSnapshot =
              await transaction.get(
                oldUsernameReference,
              )

            deleteOldUsername =
              oldUsernameSnapshot.exists() &&
              oldUsernameSnapshot
                .data()
                .uid === activeUser.uid
          }

          if (deleteOldUsername) {
            transaction.delete(
              oldUsernameReference,
            )
          }

          transaction.set(
            usernameReference,
            {
              uid: activeUser.uid,
              username:
                `@${cleanUsername}`,
              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          )

          transaction.set(
            userReference,
            {
              ...newProfile,
              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          )
        },
      )

      profileRef.current = newProfile
      setProfile(newProfile)
      requestPersistentDeviceStorage()
      setAuthError('')
      profileSaveInProgressRef.current = false

      return true
    } catch (error) {
      console.error(
        'Could not save profile:',
        error,
      )
      profileSaveInProgressRef.current = false

      if (
        error instanceof Error &&
        error.message ===
          'USERNAME_TAKEN'
      ) {
        setAuthError(
          'Daardie gebruikersnaam is reeds geneem.',
        )
      } else {
        setAuthError(
          'Ons kon nie jou profiel stoor nie.',
        )
      }

      return false
    }
  }

  const clearAuthError = () => {
    setAuthError('')
  }

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    profileLoading,
    authError,
    checkUsernameAvailability,
    saveProfile,
    clearAuthError,
  }

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}
