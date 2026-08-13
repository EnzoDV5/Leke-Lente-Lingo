import {
  getApps,
  initializeApp,
} from 'firebase/app'

import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth'

import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

import {
  getStorage,
} from 'firebase/storage'

import type {
  Analytics,
} from 'firebase/analytics'

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID,

  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID,

  measurementId:
    import.meta.env
      .VITE_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig)

export const auth = getAuth(app)

// localStorage keeps the hidden anonymous session stable across refreshes and
// browser closes. Auth consumers wait for this before creating an account.
export const authReady = setPersistence(
  auth,
  browserLocalPersistence,
)
  .then(() => auth.authStateReady())
  .catch((error) => {
    console.error(
      'Could not set auth persistence:',
      error,
    )

    // Never fall back to an in-memory anonymous UID: it would disappear when
    // the tab closes and strand all profile data created under that identity.
    throw error
  })

// Keep pending festival activity on the device when reception drops. Live
// listeners render cached writes immediately and Firestore synchronises them
// with the backend as soon as the connection returns.
function initialiseDatabase() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  } catch {
    // Vite can re-evaluate this module during development after Firestore was
    // already initialised. Reuse that instance instead of replacing it.
    return getFirestore(app)
  }
}

export const db = initialiseDatabase()

export const storage = getStorage(app)

export let analytics: Analytics | null = null

// Split into its own chunk instead of the main bundle -- analytics has no
// effect on anything the user sees, so it doesn't need to block initial load.
if (typeof window !== 'undefined') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) =>
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app)
        }
      }),
    )
    .catch(() => {
      analytics = null
    })
}

if (import.meta.env.DEV) {
  console.info(
    `Firebase connected to: ${app.options.projectId}`,
  )
}

export default app
