import type { ChallengeId } from '../challenges/challengeConfig'

export const POSTER_IMAGES: Record<ChallengeId, string> = {
  doop: '/posters/doop-dit.webp',
  remix: '/posters/steel-en-verbeter.webp',
  guess: '/posters/raai-die-woord.webp',
  photo: '/posters/foto-doop.webp',
  friend: '/posters/daag-n-maat-uit.webp',
  wildcard: '/posters/wildcard.webp',
}

// Sampled from each poster's own background so the flat "mystery" card
// colour (and the icon+name fallback if the photo itself 404s) matches the
// artwork that gets revealed once it's collected.
export const POSTER_COLOURS: Record<ChallengeId, string> = {
  doop: '#f8a91a',
  remix: '#82d2da',
  guess: '#ffca18',
  photo: '#2858df',
  friend: '#ff1977',
  wildcard: '#f03a2e',
}
