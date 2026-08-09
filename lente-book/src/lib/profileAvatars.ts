const profileModules = import.meta.glob<string>(
  '../assets/elements/Profiles/*.webp',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

export const PROFILE_AVATARS = Object.entries(profileModules)
  .map(([path, src]) => {
    const number = Number(path.match(/Profile (\d+)\.webp$/)?.[1] ?? 0)

    return {
      id: `profile-${number}`,
      number,
      name: `Profiel ${number}`,
      src,
    }
  })
  .filter((avatar) => avatar.number > 0)
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
