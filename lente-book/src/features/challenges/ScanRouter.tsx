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
  completeChallenge,
  findExistingChallengeResult,
} from '../../lib/challengeProgress'

import {
  useChallengeProgress,
} from '../../hooks/useChallengeProgress'
import ChallengeSuccess from './ChallengeSuccess'
import LoadingCard from '../../components/ui/LoadingCard'

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

    case 'vote':
      return `/challenge/stem?${queryString}`

    case 'photo':
      return `/challenge/foto?${queryString}`

    case 'friend':
      return `/challenge/maat?${queryString}`

    case 'wildcard':
      return `/challenge/wildcard?${queryString}`
  }
}

function isLocationChallenge(
  challengeId: ChallengeId,
) {
  return challengeId === 'doop' ||
    challengeId === 'remix'
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

  const [unlockedChallenge, setUnlockedChallenge] =
    useState<ChallengeId | null>(null)

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
        'Hierdie QR-kode behoort nie aan ’n geldige Lente Book-poster nie.',
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
      const destination = challengeDestination(
        challengeId,
        phraseId,
        area,
      )

      const openScannedLocation = (
        posterJustClaimed = false,
      ) => {
        navigate(destination, {
          replace: true,
          state: posterJustClaimed
            ? { posterJustClaimed: true }
            : undefined,
        })
      }

      /*
       * If the user completed this challenge
       * earlier, scanning collects it immediately.
       */
      if (
        progress[challengeId]
          .challengeCompleted
      ) {
        if (progress[challengeId].collected) {
          if (isLocationChallenge(challengeId)) {
            openScannedLocation()
            return
          }

          navigate(`/collections?poster=${challengeId}`, { replace: true })
          return
        }

        await collectChallenge(
          user.uid,
          challengeId,
        )

        if (isLocationChallenge(challengeId)) {
          openScannedLocation(true)
          return
        }

        setUnlockedChallenge(challengeId)

        return
      }

      const existingResult = await findExistingChallengeResult(user.uid, challengeId)
      if (existingResult) {
        await completeChallenge(user.uid, challengeId, true, existingResult)

        if (isLocationChallenge(challengeId)) {
          openScannedLocation(true)
          return
        }

        setUnlockedChallenge(challengeId)
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

      openScannedLocation()
    }

    void openChallenge().catch(
      (scanError) => {
        console.error(
          'Scan router error:',
          scanError,
        )

        setError(
          'Ons kon nie hierdie poster versamel nie. Probeer weer.',
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
            to="/collections"
            className="mt-6 inline-block border-3 border-black bg-[#ffcf18] px-6 py-3 font-display font-black text-black shadow-[4px_4px_0_#000]"
          >
            Gaan na my versameling
          </Link>
        </section>
      </main>
    )
  }

  if (unlockedChallenge) {
    const unlocked = CHALLENGES[unlockedChallenge]
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <ChallengeSuccess
          challengeId={unlockedChallenge}
          icon={unlocked.icon}
          unlockOnly
          title={`${unlocked.name} ontsluit!`}
          text="Jy het hierdie uitdaging reeds voltooi. Die QR-kode het nou jou poster ontsluit."
        />
      </main>
    )
  }

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 text-center">
      <LoadingCard label={isChallengeId(challengeId) ? `${CHALLENGES[challengeId].name} word oopgemaak…` : 'Jou QR-kode word nagegaan…'} />
    </main>
  )
}
