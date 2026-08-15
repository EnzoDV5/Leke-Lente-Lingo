import { useMemo, useRef } from 'react'

import DataSkeleton from '../../components/ui/DataSkeleton'
import PhraseCard from '../../components/ui/PhraseCard'
import Reveal from '../../components/ui/Reveal'
import Section from '../../components/ui/Section'
import { useLeaderboard, type LeaderboardWord } from '../../hooks/useLeaderboard'
import { useLivePhrases, type LivePhrase } from '../../hooks/useLivePhrases'
import { useScrollSyncedBackground } from '../../hooks/useScrollSyncedBackground'
import { frases, mockRankedWords } from '../../lib/mockData'
import type { FestivalArea, Frase, Woord } from '../../types'
import FallingText from './FallingText'
import styles from './AfterPopularPhrases.module.css'

const FESTIVAL_AREAS: FestivalArea[] = ['bathroom', 'smoking', 'bar', 'stages']

const AREA_BOARD_NAMES: Record<FestivalArea, string> = {
  bathroom: 'Die Poep-Pods',
  smoking: 'Die Choef-hoek',
  bar: 'Die Dopstop',
  stages: 'Die Beats Blok',
}

const DUMMY_FALLING_WORDS = mockRankedWords.map(({ phrase, word }) => ({
  id: `dummy-${phrase.id}-${word.id}`,
  text: word.woord,
  votes: word.stemme,
}))

function liveWordsForPhrase(words: LeaderboardWord[], phraseId: string) {
  return words.filter((word) => word.phraseId === phraseId)
}

function phrasePopularity(phrase: LivePhrase, words: LeaderboardWord[]) {
  const liveWords = liveWordsForPhrase(words, phrase.id)
  const mockPhrase = frases.find((candidate) => candidate.id === phrase.id)

  return {
    hasLiveWords: liveWords.length > 0,
    submissions: liveWords.length,
    votes: liveWords.reduce((total, word) => total + word.upVotes, 0),
    fallbackVotes: Math.max(0, ...(mockPhrase?.woorde.map((word) => word.stemme) ?? [])),
  }
}

function toPhraseCard(phrase: LivePhrase, words: LeaderboardWord[]): Frase {
  const mockPhrase = frases.find((candidate) => candidate.id === phrase.id)
  const liveWords = liveWordsForPhrase(words, phrase.id)
    .sort((first, second) => second.upVotes - first.upVotes || second.score - first.score)
    .map<Woord>((word) => ({
      id: word.id,
      woord: word.text,
      handle: word.createdByUsername,
      stemme: word.upVotes,
    }))

  return {
    id: phrase.id,
    beskrywing: phrase.text,
    kleur: phrase.colour || mockPhrase?.kleur || 'groen',
    bord: mockPhrase?.bord ?? AREA_BOARD_NAMES[phrase.area],
    area: phrase.area,
    createdByUsername: mockPhrase?.createdByUsername,
    createdByAvatar: mockPhrase?.createdByAvatar,
    woorde: liveWords.length ? liveWords : (mockPhrase?.woorde ?? []),
  }
}

export default function AfterPopularPhrases() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { phrases, loading: phrasesLoading } = useLivePhrases()
  const { words, loading: wordsLoading } = useLeaderboard()
  useScrollSyncedBackground(true, sectionRef)

  const popularPhrases = useMemo(() => FESTIVAL_AREAS
    .map((area) => {
      const candidates = phrases.filter((phrase) => phrase.area === area && !phrase.isWildcard)
      const winner = [...candidates].sort((first, second) => {
        const firstPopularity = phrasePopularity(first, words)
        const secondPopularity = phrasePopularity(second, words)

        if (firstPopularity.hasLiveWords !== secondPopularity.hasLiveWords) {
          return secondPopularity.hasLiveWords ? 1 : -1
        }

        return secondPopularity.votes - firstPopularity.votes ||
          secondPopularity.submissions - firstPopularity.submissions ||
          secondPopularity.fallbackVotes - firstPopularity.fallbackVotes ||
          first.boardNumber - second.boardNumber
      })[0]

      const fallback = frases
        .filter((phrase) => phrase.area === area && phrase.bord !== 'Wildcard-skeppings')
        .sort((first, second) =>
          Math.max(0, ...second.woorde.map((word) => word.stemme)) -
          Math.max(0, ...first.woorde.map((word) => word.stemme)),
        )[0]

      if (winner) return toPhraseCard(winner, words)
      return fallback
    })
    .filter((phrase): phrase is Frase => Boolean(phrase)), [phrases, words])

  const createdFallingWords = useMemo(() => [...words]
    .sort((first, second) => second.upVotes - first.upVotes || second.score - first.score)
    .map((word) => ({
      id: `live-${word.id}`,
      text: word.text.trim(),
      votes: word.upVotes,
    }))
    .filter((word) => Boolean(word.text)), [words])
  const fallingWords = useMemo(() => [...DUMMY_FALLING_WORDS, ...createdFallingWords]
    .sort((first, second) => second.votes - first.votes)
    .slice(0, 30)
    .map((word, index) => ({
      ...word,
      scale: index < 3 ? 1.65 : 1,
    })), [createdFallingWords])
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
          <p>★ EEN UIT ELKE FEESHOEK ★</p>
          <h2>Die frases wat bly steek</h2>
          <span>Elke plek se gewildste frase, saam met die woord wat bo uitgekom het.</span>
        </header>
      </Reveal>

      {loading ? (
        <div className={styles.loading}>
          <DataSkeleton count={4} label="Die gewildste frases word gelaai" />
        </div>
      ) : (
        <div className={styles.phraseList}>
          {popularPhrases.map((phrase, index) => (
            <Reveal key={phrase.id} delay={index * 80}>
              <PhraseCard frase={phrase} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
