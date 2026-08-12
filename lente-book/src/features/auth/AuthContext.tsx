import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  deleteUser,
  getRedirectResult,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'

import {
  auth,
  db,
  googleProvider,
  storage,
} from '../../lib/firebase'

export type LenteProfile = {
  uid: string
  username: string
  character: string
  useGooglePhoto: boolean
  googlePhoto?: string | null
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

  signInWithGoogle: () => Promise<boolean>

  checkUsernameAvailability: (
    username: string,
  ) => Promise<boolean>

  saveProfile: (
    details: SaveProfileInput,
  ) => Promise<boolean>

  logOut: () => Promise<boolean>
  deleteAccount: () => Promise<boolean>
  clearAuthError: () => void
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined)

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

function shouldFallBackToRedirect(
  error: unknown,
): boolean {
  if (!(error instanceof Error)) return false

  return [
    'auth/popup-blocked',
    'auth/operation-not-supported-in-this-environment',
  ].some((code) => error.message.includes(code))
}

function friendlyError(
  error: unknown,
): string {
  if (!(error instanceof Error)) {
    return 'Iets het verkeerd geloop.'
  }

  if (
    error.message.includes(
      'auth/popup-closed-by-user',
    )
  ) {
    return 'Die aanmeldvenster is toegemaak.'
  }

  if (
    error.message.includes(
      'auth/popup-blocked',
    )
  ) {
    return 'Jou blaaier het die aanmeldvenster geblokkeer.'
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
      'auth/account-exists-with-different-credential',
    )
  ) {
    return 'Hierdie e-pos is reeds met ’n ander metode gekoppel.'
  }

  if (
    error.message.includes(
      'auth/web-storage-unsupported',
    )
  ) {
    return 'Jou blaaier blokkeer die berging wat nodig is om aan te meld. Skakel privaat blaai af en probeer weer.'
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

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true)

  const [authError, setAuthError] =
    useState('')

  const loadProfile = async (
    firebaseUser: User,
  ): Promise<LenteProfile | null> => {
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
        const loadedProfile =
          snapshot.data() as LenteProfile

        setProfile(loadedProfile)
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
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          setUser(firebaseUser)
          setLoading(false)

          if (firebaseUser) {
            await loadProfile(
              firebaseUser,
            )
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

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error(
        'Redirect sign-in error:',
        error,
      )

      setAuthError(
        friendlyError(error),
      )
    })
  }, [])

  // Popups don't depend on the authDomain redirect relay, so they work the
  // same on localhost, the hosted app, and any device. We only fall back to
  // a redirect when the environment genuinely can't open a popup (blocked,
  // or an embedded/in-app browser).
  const signInWithGoogle =
    async (): Promise<boolean> => {
      setAuthError('')

      try {
        await signInWithPopup(
          auth,
          googleProvider,
        )

        return true
      } catch (error) {
        if (
          shouldFallBackToRedirect(error)
        ) {
          try {
            await signInWithRedirect(
              auth,
              googleProvider,
            )

            return true
          } catch (redirectError) {
            console.error(
              'Google sign-in error:',
              redirectError,
            )

            setAuthError(
              friendlyError(
                redirectError,
              ),
            )

            return false
          }
        }

        console.error(
          'Google sign-in error:',
          error,
        )

        setAuthError(
          friendlyError(error),
        )

        return false
      }
    }

  const checkUsernameAvailability =
    async (
      username: string,
    ): Promise<boolean> => {
      if (!user) return false

      const cleanUsername =
        normaliseUsername(username)

      if (cleanUsername.length < 3) {
        return false
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
          return true
        }

        return (
          usernameSnapshot.data().uid ===
          user.uid
        )
      } catch (error) {
        console.error(
          'Username check failed:',
          error,
        )

        return false
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

    const cleanUsername =
      normaliseUsername(
        details.username,
      )

    if (cleanUsername.length < 3) {
      setAuthError(
        'Jou gebruikersnaam moet minstens 3 karakters hê.',
      )

      return false
    }

    const userReference = doc(
      db,
      'users',
      user.uid,
    )

    const usernameReference = doc(
      db,
      'usernames',
      cleanUsername,
    )

    const newProfile: LenteProfile = {
      uid: user.uid,
      username: `@${cleanUsername}`,
      character:
        details.character,
      useGooglePhoto:
        details.useGooglePhoto,
      googlePhoto: user.photoURL,
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
              .uid !== user.uid
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
                .uid === user.uid
          }

          if (deleteOldUsername) {
            transaction.delete(
              oldUsernameReference,
            )
          }

          transaction.set(
            usernameReference,
            {
              uid: user.uid,
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
              email: user.email,
              googleName:
                user.displayName,
              googlePhoto:
                user.photoURL,
              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          )
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

  const logOut = async () => {
    try {
      await signOut(auth)

      setUser(null)
      setProfile(null)

      return true
    } catch (error) {
      console.error(
        'Sign-out error:',
        error,
      )

      setAuthError(
        'Ons kon jou nie uitteken nie.',
      )

      return false
    }
  }

  const deleteAccount = async () => {
    if (!user) return false

    setAuthError('')

    try {
      await reauthenticateWithPopup(
        user,
        googleProvider,
      )

      const [wordsSnapshot, votesSnapshot, photosSnapshot, postersSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'words'), where('createdByUid', '==', user.uid))),
        getDocs(query(collection(db, 'votes'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'photos'), where('createdByUid', '==', user.uid))),
        getDocs(collection(db, 'users', user.uid, 'posters')),
      ])

      await Promise.all(
        photosSnapshot.docs.map(async (photoDocument) => {
          const storagePath = String(photoDocument.data().storagePath ?? '')
          if (!storagePath) return
          try {
            await deleteObject(ref(storage, storagePath))
          } catch (storageError) {
            const errorCode = storageError && typeof storageError === 'object' && 'code' in storageError
              ? String(storageError.code)
              : ''
            if (errorCode !== 'storage/object-not-found') throw storageError
          }
        }),
      )

      const documentsToDelete = [
        ...wordsSnapshot.docs.map((item) => item.ref),
        ...votesSnapshot.docs.map((item) => item.ref),
        ...photosSnapshot.docs.map((item) => item.ref),
        ...postersSnapshot.docs.map((item) => item.ref),
      ]

      const username = profile?.username.replace(/^@/, '').toLowerCase()
      if (username) documentsToDelete.push(doc(db, 'usernames', username))

      for (let index = 0; index < documentsToDelete.length; index += 450) {
        const batch = writeBatch(db)
        documentsToDelete.slice(index, index + 450).forEach((reference) => batch.delete(reference))
        await batch.commit()
      }

      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(user)

      setUser(null)
      setProfile(null)
      return true
    } catch (error) {
      console.error('Account deletion error:', error)
      setAuthError(
        'Ons kon nie jou rekening uitvee nie. Meld weer aan en probeer asseblief weer.',
      )
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
    signInWithGoogle,
    checkUsernameAvailability,
    saveProfile,
    logOut,
    deleteAccount,
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
