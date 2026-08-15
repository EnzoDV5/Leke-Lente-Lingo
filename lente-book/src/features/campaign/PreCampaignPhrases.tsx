import { useMemo, useRef } from 'react'

import DataSkeleton from '../../components/ui/DataSkeleton'
import PhraseCard from '../../components/ui/PhraseCard'
import Reveal from '../../components/ui/Reveal'
import Section from '../../components/ui/Section'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { useLivePhrases } from '../../hooks/useLivePhrases'
import { useScrollSyncedBackground } from '../../hooks/useScrollSyncedBackground'
import { frases, mockRankedWords } from '../../lib/mockData'
import type { Frase, Woord } from '../../types'
import { useCampaign } from './CampaignProvider'
import FallingText from './FallingText'
import styles from './PreCampaignPhrases.module.css'

const DUMMY_FALLING_WORDS = mockRankedWords.map(({ phrase, word }) => ({
  id: `dummy-${phrase.id}-${word.id}`,
  text: word.woord,
  votes: word.stemme,
}))

export default function PreCampaignPhrases() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { featuredPhraseIds } = useCampaign()
  const { phrases, loading: phrasesLoading } = useLivePhrases()
  const { words, loading: wordsLoading } = useLeaderboard()
  useScrollSyncedBackground(true, sectionRef)

  const featuredPhrases = useMemo(() => featuredPhraseIds
    .slice(0, 4)
    .map<Frase | null>((phraseId) => {
      const livePhrase = phrases.find((phrase) => phrase.id === phraseId)
      const fallback = frases.find((phrase) => phrase.id === phraseId)
      if (!livePhrase && !fallback) return null

      const liveWords = words
        .filter((word) => word.phraseId === phraseId)
        .sort((first, second) => second.upVotes - first.upVotes || second.score - first.score)
        .map<Woord>((word) => ({
          id: word.id,
          woord: word.text,
          handle: word.createdByUsername,
          stemme: word.upVotes,
        }))

      return {
        id: phraseId,
        beskrywing: livePhrase?.text ?? fallback?.beskrywing ?? '',
        kleur: livePhrase?.colour || fallback?.kleur || 'groen',
        bord: fallback?.bord ?? 'Lente Book',
        area: livePhrase?.area ?? fallback?.area ?? 'stages',
        createdByUsername: fallback?.createdByUsername,
        createdByAvatar: fallback?.createdByAvatar,
        woorde: liveWords.length ? liveWords : (fallback?.woorde ?? []),
      }
    })
    .filter((phrase): phrase is Frase => phrase !== null), [featuredPhraseIds, phrases, words])

  const fallingWords = useMemo(() => [
    ...DUMMY_FALLING_WORDS,
    ...words.map((word) => ({
      id: `live-${word.id}`,
      text: word.text.trim(),
      votes: word.upVotes,
    })),
  ]
    .filter((word) => Boolean(word.text))
    .sort((first, second) => second.votes - first.votes)
    .slice(0, 30)
    .map((word, index) => ({
      ...word,
      scale: index < 3 ? 1.65 : 1,
    })), [words])

  const loading = phrasesLoading || wordsLoading

  return (
    <Section
      bg="groen"
      wydte="wyd"
      className={styles.section}
      sectionRef={sectionRef}
    >
      {!loading && (
        <FallingText
          className={styles.fallingBackdrop}
          appearance="backdrop"
          decorative
          items={fallingWords}
          highlightWords={fallingWords.slice(0, 3).map((word) => word.text)}
          highlightClass={styles.highlighted}
          trigger="scroll"
          scrollThreshold={1 / 3}
          gravity={.72}
          fontSize="clamp(1.2rem, 2vw, 1.8rem)"
          wordSpacing="clamp(2px, .3vw, 5px)"
          mouseConstraintStiffness={.9}
          bottomBoundaryInset={12}
        />
      )}

      <Reveal>
        <header className={styles.header}>
          <p>★ VIER FRASES · VIER FEESHOEKE ★</p>
          <h2>Gee dit ’n naam</h2>
          <span>Die vier scenario’s van die Instagram-stories. Kies een om die volledige frase en sy woorde te sien.</span>
        </header>
      </Reveal>

      {loading ? (
        <div className={styles.loading}>
          <DataSkeleton count={4} label="Die vier frases word gelaai" />
        </div>
      ) : (
        <div className={styles.phraseList}>
          {featuredPhrases.map((phrase, index) => (
            <Reveal key={phrase.id} delay={index * 80}>
              <PhraseCard frase={phrase} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
