import {
  getApps,
  initializeApp,
} from 'firebase/app'

import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from 'firebase/auth'

import {
  getFirestore,
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

// The default indexedDBLocalPersistence can lose its connection when the
// tab is backgrounded (e.g. while a Google sign-in popup has focus), which
// throws "Database is closing/hidden" right after a successful sign-in.
// browserLocalPersistence (localStorage) doesn't have that failure mode.
setPersistence(
  auth,
  browserLocalPersistence,
).catch((error) => {
  console.error(
    'Could not set auth persistence:',
    error,
  )
})

export const db = getFirestore(app)

export const storage = getStorage(app)

export const googleProvider =
  new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

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