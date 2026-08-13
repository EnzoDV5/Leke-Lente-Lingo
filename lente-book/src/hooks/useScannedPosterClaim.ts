import { useEffect, useRef, useState } from 'react'

import type { ChallengeId } from '../features/challenges/challengeConfig'
import { collectChallenge, completeChallenge, findExistingChallengeResult } from '../lib/challengeProgress'
import { useChallengeProgress } from './useChallengeProgress'

export function useScannedPosterClaim(
  userId: string | undefined,
  challengeId: ChallengeId,
  fromScan: boolean,
) {
  const { progress, loading } = useChallengeProgress(userId)
  const handled = useRef(false)
  const [claimed, setClaimed] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    const saved = progress[challengeId]
    if (!fromScan || !userId || loading || handled.current) return
    if (saved.collected) return

    handled.current = true
    setClaiming(true)
    const claim = async () => {
      if (saved.challengeCompleted) {
        await collectChallenge(userId, challengeId)
        return true
      }

      const existingResult = await findExistingChallengeResult(userId, challengeId)
      if (!existingResult) return false
      await completeChallenge(userId, challengeId, true, existingResult)
      return true
    }

    void claim()
      .then((didClaim) => {
        if (didClaim) setClaimed(true)
        else handled.current = false
      })
      .catch((error) => {
        handled.current = false
        console.error('Poster claim failed:', error)
      })
      .finally(() => setClaiming(false))
  }, [challengeId, fromScan, loading, progress, userId])

  return { claimed, claiming }
}
