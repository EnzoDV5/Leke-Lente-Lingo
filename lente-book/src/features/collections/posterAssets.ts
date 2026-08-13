import type { ChallengeId } from '../challenges/challengeConfig'
import challengeChommiePoster from '../../assets/elements/posters/challenge n chommie@2x.webp'
import merkDitPoster from '../../assets/elements/posters/merk dit poster@2x.webp'
import raaiDieWoordPoster from '../../assets/elements/posters/raai die woord@2x.webp'
import steelVerbeterPoster from '../../assets/elements/posters/steel en verbeter poster@2x.webp'
import stemPoster from '../../assets/elements/posters/stem poster.webp'
import wildKaartPoster from '../../assets/elements/posters/wild kaart poster@2x.webp'

export const POSTER_IMAGES: Record<ChallengeId, string> = {
  doop: merkDitPoster,
  remix: steelVerbeterPoster,
  guess: raaiDieWoordPoster,
  photo: '/posters/foto-doop.webp',
  friend: challengeChommiePoster,
  vote: stemPoster,
  wildcard: wildKaartPoster,
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
  vote: '#19ad62',
  wildcard: '#f03a2e',
}
