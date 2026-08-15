/** Canonical display copy for the 13 official board scenarios.
 * IDs, locations and meanings stay stable so QR links and saved words keep
 * working even when the writing is refreshed.
 *
 * Wording here must stay word-for-word identical to whatever phrasing runs
 * on the matching Instagram post — this is the single source of truth that
 * every campaign phase (pre/live/post) and every surface (mock data, live
 * Firestore fallbacks) pulls from via officialPhraseText(). */
export const OFFICIAL_PHRASE_COPY: Record<string, string> = {
  'poep-pods-warm-seat': 'Wat noem jy daai ongemaklike gevoel wanneer die toilet seat nog warm is?',
  'poep-pods-deure': 'Iemand probeer elke toiletdeur sonder om eers te klop. Gee dié persoon ’n naam.',
  'poep-pods-twee': 'Twee mense probeer saam in een portable toilet pas. Watter woord beskryf dit?',
  'choef-hoek-pull': 'Wat noem jy iemand wat nooit hulle eie choef bring nie, maar altyd vra vir ’n pull?',
  'choef-hoek-lighter': 'Altyd sigarette, maar nooit ’n lighter nie. Gee dié persoon ’n naam.',
  'choef-hoek-crowded': 'Wat noem jy dit wanneer die smoking area meer crowded as die stage raak?',
  'dopstop-bankkaart': 'Wat noem jy iemand wat hulle bankkaart tik en hoop vir die beste?',
  'dopstop-rondte': 'Hulle koop nooit hulle eie rondte nie, maar drink altyd eerste. Gee dié persoon ’n naam.',
  'dopstop-verdwyn': 'Wat noem jy die persoon wat altyd by die bar verdwyn wanneer dit hulle beurt is om te betaal?',
  'beats-blok-skouers': 'Iemand klim op iemand se skouers en niemand agter hulle kan sien nie. Watter woord pas?',
  'beats-blok-drinks': 'Wat noem jy iemand wat almal se drinks uitstamp met hulle dansmoves?',
  'beats-blok-screens': 'Wat noem jy dit wanneer jy so ver agter staan dat jy net die screens kyk?',
  'beats-blok-bass': 'Wat noem jy dit wanneer die bass jou drink laat bewe?',
}

export function officialPhraseText(phraseId: string, fallback = '') {
  return OFFICIAL_PHRASE_COPY[phraseId] ?? fallback
}
