import profile2 from '../assets/elements/Profiles/Profile 2.webp'
import profile3 from '../assets/elements/Profiles/Profile 3.webp'
import profile4 from '../assets/elements/Profiles/Profile 4.webp'
import profile5 from '../assets/elements/Profiles/Profile 5.webp'
import profile6 from '../assets/elements/Profiles/Profile 6.webp'
import profile7 from '../assets/elements/Profiles/Profile 7.webp'
import profile8 from '../assets/elements/Profiles/Profile 8.webp'
import profile9 from '../assets/elements/Profiles/Profile 9.webp'
import profile10 from '../assets/elements/Profiles/Profile 10.webp'
import profile11 from '../assets/elements/Profiles/Profile 11.webp'
import profile12 from '../assets/elements/Profiles/Profile 12.webp'
import profile13 from '../assets/elements/Profiles/Profile 13.webp'
import profile14 from '../assets/elements/Profiles/Profile 14.webp'
import profile15 from '../assets/elements/Profiles/Profile 15.webp'
import profile16 from '../assets/elements/Profiles/Profile 16.webp'
import profile17 from '../assets/elements/Profiles/Profile 17.webp'
import profile18 from '../assets/elements/Profiles/Profile 18.webp'
import profile19 from '../assets/elements/Profiles/Profile 19.webp'
import profile20 from '../assets/elements/Profiles/Profile 20.webp'
import profile21 from '../assets/elements/Profiles/Profile 21.webp'
import profile22 from '../assets/elements/Profiles/Profile 22.webp'
import profile23 from '../assets/elements/Profiles/Profile 23.webp'
import profile24 from '../assets/elements/Profiles/Profile 24.webp'

// import.meta.glob(..., { query: '?url' }) resolved to raw, unprocessed
// path strings in this project's Vite 8 build instead of real emitted asset
// URLs (the files never made it into dist/assets), leaving the avatar
// carousel empty in production even though it worked in dev. Explicit
// static imports are the well-trodden path -- other space-containing
// filenames in this project already round-trip fine through them.
const RAW_PROFILE_AVATARS: Array<{ number: number, src: string }> = [
  { number: 2, src: profile2 },
  { number: 3, src: profile3 },
  { number: 4, src: profile4 },
  { number: 5, src: profile5 },
  { number: 6, src: profile6 },
  { number: 7, src: profile7 },
  { number: 8, src: profile8 },
  { number: 9, src: profile9 },
  { number: 10, src: profile10 },
  { number: 11, src: profile11 },
  { number: 12, src: profile12 },
  { number: 13, src: profile13 },
  { number: 14, src: profile14 },
  { number: 15, src: profile15 },
  { number: 16, src: profile16 },
  { number: 17, src: profile17 },
  { number: 18, src: profile18 },
  { number: 19, src: profile19 },
  { number: 20, src: profile20 },
  { number: 21, src: profile21 },
  { number: 22, src: profile22 },
  { number: 23, src: profile23 },
  { number: 24, src: profile24 },
]

export const PROFILE_AVATARS = RAW_PROFILE_AVATARS
  .map(({ number, src }) => ({
    id: `profile-${number}`,
    number,
    name: `Profiel ${number}`,
    src,
  }))
  .sort((a, b) => a.number - b.number)

export function profileAvatar(number: number) {
  return PROFILE_AVATARS.find((avatar) => avatar.number === number)?.src ?? ''
}

export function fallbackProfileAvatar(seed = '') {
  if (!PROFILE_AVATARS.length) return ''

  const index = Array.from(seed).reduce(
    (total, character) => total + character.codePointAt(0)!,
    0,
  ) % PROFILE_AVATARS.length

  return PROFILE_AVATARS[index].src
}

export function resolveProfileAvatar(value?: string | null) {
  if (!value) return null

  const selected = PROFILE_AVATARS.find(
    (avatar) => avatar.id === value || avatar.src === value,
  )

  if (selected) return selected.src

  /*
   * Older profiles stored Vite's generated asset URL instead of the stable
   * profile id. That filename changes between deployments. Recover the
   * profile number from those legacy URLs and point it at the current asset.
   */
  const decodedValue = (() => {
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  })()
  const legacyNumber = Number(
    decodedValue.match(/profile[\s_-]*(\d+)/i)?.[1] ?? 0,
  )
  if (legacyNumber) {
    return profileAvatar(legacyNumber) || null
  }

  return value.startsWith('/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
    ? value
    : null
}

export function stableProfileAvatarId(value?: string | null) {
  if (!value) return ''

  const directMatch = PROFILE_AVATARS.find(
    (avatar) => avatar.id === value || avatar.src === value,
  )
  if (directMatch) return directMatch.id

  const decodedValue = (() => {
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  })()
  const legacyNumber = Number(
    decodedValue.match(/profile[\s_-]*(\d+)/i)?.[1] ?? 0,
  )

  return legacyNumber && profileAvatar(legacyNumber)
    ? `profile-${legacyNumber}`
    : value
}
