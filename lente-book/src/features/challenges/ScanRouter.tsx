import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

import {
  CHALLENGES,
  isChallengeId,
  type ChallengeId,
} from './challengeConfig'

import {
  collectChallenge,
} from '../../lib/challengeProgress'

import {
  useChallengeProgress,
} from '../../hooks/useChallengeProgress'

function challengeDestination(
  challengeId: ChallengeId,
  phraseId: string,
  area: string,
) {
  const query = new URLSearchParams()

  query.set('scan', '1')

  if (area) {
    query.set('area', area)
  }

  const queryString = query.toString()

  switch (challengeId) {
    case 'doop':
      return `/challenge/doop/${phraseId}?${queryString}`

    case 'remix':
      return `/challenge/remix/${phraseId}?${queryString}`

    case 'guess':
      return `/challenge/raai?${queryString}`

    case 'photo':
      return `/challenge/foto?${queryString}`

    case 'friend':
      return `/challenge/maat?${queryString}`

    case 'wildcard':
      return `/challenge/wildcard?${queryString}`
  }
}

export default function ScanRouter() {
  const { challengeId } = useParams()

  const [searchParams] =
    useSearchParams()

  const navigate = useNavigate()

  const {
    user,
  } = useAuth()

  const {
    progress,
    wildcardUnlocked,
    loading,
  } = useChallengeProgress(user?.uid)

  const [error, setError] =
    useState('')

  const handled = useRef(false)

  useEffect(() => {
    if (
      loading ||
      !user ||
      handled.current
    ) {
      return
    }

    handled.current = true

    if (!isChallengeId(challengeId)) {
      setError(
        'Hierdie QR-kode behoort nie aan ’n geldige Lente Book-plakkaat nie.',
      )

      return
    }

    const phraseId =
      searchParams.get('phrase') ?? ''

    const area =
      searchParams.get('area') ?? ''

    if (
      (challengeId === 'doop' ||
        challengeId === 'remix') &&
      !phraseId
    ) {
      setError(
        'Hierdie bord se QR-kode kort ’n frase-ID.',
      )

      return
    }

    const openChallenge = async () => {
      /*
       * If the user completed this challenge
       * earlier, scanning collects it immediately.
       */
      if (
        progress[challengeId]
          .challengeCompleted
      ) {
        await collectChallenge(
          user.uid,
          challengeId,
        )

        navigate(
          `/woordjag?collected=${challengeId}`,
          {
            replace: true,
          },
        )

        return
      }

      /*
       * Wildcard remains visible but locked.
       */
      if (
        challengeId === 'wildcard' &&
        !wildcardUnlocked
      ) {
        navigate(
          '/challenge/wildcard?locked=1&scan=1',
          {
            replace: true,
          },
        )

        return
      }

      navigate(
        challengeDestination(
          challengeId,
          phraseId,
          area,
        ),
        {
          replace: true,
        },
      )
    }

    void openChallenge().catch(
      (scanError) => {
        console.error(
          'Scan router error:',
          scanError,
        )

        setError(
          'Ons kon nie hierdie plakkaat versamel nie. Probeer weer.',
        )
      },
    )
  }, [
    challengeId,
    loading,
    navigate,
    progress,
    searchParams,
    user,
    wildcardUnlocked,
  ])

  if (error) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 py-12">
        <section className="w-full border-4 border-black bg-[#fff7df] p-7 text-center shadow-[8px_8px_0_#000]">
          <span className="text-5xl">
            ⚠️
          </span>

          <h1 className="mt-4 font-display text-3xl text-black">
            QR-probleem
          </h1>

          <p className="mt-3 text-black">
            {error}
          </p>

          <Link
            to="/woordjag"
            className="mt-6 inline-block border-3 border-black bg-[#ffcf18] px-6 py-3 font-display font-black text-black shadow-[4px_4px_0_#000]"
          >
            Gaan na my versameling
          </Link>
        </section>
      </main>
    )
  }

  const challenge =
    isChallengeId(challengeId)
      ? CHALLENGES[challengeId]
      : null

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div>
        <span className="text-6xl">
          {challenge?.icon ?? '⚡'}
        </span>

        <h1 className="mt-4 font-display text-3xl text-white">
          {challenge?.name ??
            'Plakkaat word oopgemaak'}
        </h1>

        <p className="mt-2 text-white/75">
          Jou QR-kode word nagegaan...
        </p>
      </div>
    </main>
  )
}