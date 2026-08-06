import {
  getApps,
  initializeApp,
} from 'firebase/app'

import {
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth'

import {
  getFirestore,
} from 'firebase/firestore'

import {
  getStorage,
} from 'firebase/storage'

import {
  getAnalytics,
  isSupported,
  type Analytics,
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

export const db = getFirestore(app)

export const storage = getStorage(app)

export const googleProvider =
  new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export let analytics: Analytics | null = null

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
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