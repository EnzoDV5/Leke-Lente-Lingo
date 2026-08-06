import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import {
  auth,
  db,
  googleProvider,
} from '../../lib/firebase'

export type LenteProfile = {
  uid: string
  username: string
  character: string
  useGooglePhoto: boolean
  onboardingComplete: boolean
}

type SaveProfileInput = {
  username: string
  character: string
  useGooglePhoto: boolean
}

type AuthContextValue = {
  user: User | null
  profile: LenteProfile | null
  loading: boolean
  profileLoading: boolean
  authError: string

  signInWithGoogle: () => Promise<User | null>
  saveProfile: (
    details: SaveProfileInput,
  ) => Promise<boolean>
  logOut: () => Promise<void>
  clearAuthError: () => void
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  )

type AuthProviderProps = {
  children: ReactNode
}

function friendlyError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Iets het verkeerd geloop.'
  }

  if (
    error.message.includes(
      'auth/popup-closed-by-user',
    )
  ) {
    return 'Die Google-venster is toegemaak.'
  }

  if (
    error.message.includes(
      'auth/popup-blocked',
    )
  ) {
    return 'Jou blaaier het die Google-venster geblokkeer.'
  }

  if (
    error.message.includes(
      'auth/unauthorized-domain',
    )
  ) {
    return 'Hierdie domein is nog nie in Firebase toegelaat nie.'
  }

  return 'Iets het verkeerd geloop. Probeer weer.'
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null)

  const [profile, setProfile] =
    useState<LenteProfile | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [profileLoading, setProfileLoading] =
    useState(true)

  const [authError, setAuthError] =
    useState('')

  const loadProfile = async (
    firebaseUser: User,
  ) => {
    setProfileLoading(true)

    try {
      const profileReference = doc(
        db,
        'users',
        firebaseUser.uid,
      )

      const snapshot =
        await getDoc(profileReference)

      if (snapshot.exists()) {
        setProfile(
          snapshot.data() as LenteProfile,
        )
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error(
        'Could not load profile:',
        error,
      )

      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)

        if (firebaseUser) {
          await loadProfile(firebaseUser)
        } else {
          setProfile(null)
          setProfileLoading(false)
        }
      },
      (error) => {
        console.error(
          'Authentication error:',
          error,
        )

        setAuthError(
          'Ons kon nie jou aanmeldstatus nagaan nie.',
        )

        setLoading(false)
        setProfileLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const signInWithGoogle =
    async (): Promise<User | null> => {
      setAuthError('')

      try {
        const result = await signInWithPopup(
          auth,
          googleProvider,
        )

        return result.user
      } catch (error) {
        console.error(
          'Google sign-in error:',
          error,
        )

        setAuthError(friendlyError(error))

        return null
      }
    }

  const saveProfile = async (
    details: SaveProfileInput,
  ): Promise<boolean> => {
    if (!user) {
      setAuthError(
        'Jy moet eers met Google aanmeld.',
      )

      return false
    }

    const cleanUsername = details.username
      .trim()
      .replace(/\s+/g, '_')
      .replace(/^@/, '')
      .toLowerCase()

    if (cleanUsername.length < 3) {
      setAuthError(
        'Jou gebruikersnaam moet minstens 3 karakters hê.',
      )

      return false
    }

    const newProfile: LenteProfile = {
      uid: user.uid,
      username: `@${cleanUsername}`,
      character: details.character,
      useGooglePhoto:
        details.useGooglePhoto,
      onboardingComplete: true,
    }

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...newProfile,
          email: user.email,
          googleName: user.displayName,
          googlePhoto: user.photoURL,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        },
      )

      setProfile(newProfile)
      setAuthError('')

      return true
    } catch (error) {
      console.error(
        'Could not save profile:',
        error,
      )

      setAuthError(
        'Ons kon nie jou profiel stoor nie.',
      )

      return false
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)

      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error(
        'Sign-out error:',
        error,
      )

      setAuthError(
        'Ons kon jou nie uitteken nie.',
      )
    }
  }

  const clearAuthError = () => {
    setAuthError('')
  }

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      authError,
      signInWithGoogle,
      saveProfile,
      logOut,
      clearAuthError,
    }),
    [
      user,
      profile,
      loading,
      profileLoading,
      authError,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}