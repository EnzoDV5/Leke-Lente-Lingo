/** Canonical display copy for the 12 official board scenarios.
 * IDs, locations and meanings stay stable so QR links and saved words keep
 * working even when the writing is refreshed. */
export const OFFICIAL_PHRASE_COPY: Record<string, string> = {
  'poep-pods-warm-seat': 'Wat noem jy dit wanneer die toilet seat nog warm is en daai ongemaklike gevoel inskop?',
  'poep-pods-deure': 'Iemand probeer elke toiletdeur sonder om eers te klop. Gee dié persoon ’n naam.',
  'poep-pods-twee': 'Twee mense probeer saam in een portable toilet pas. Watter woord beskryf dit?',
  'choef-hoek-pull': 'Hulle bring nooit hulle eie choef nie, maar vra altyd vir ’n pull. Wat noem jy so iemand?',
  'choef-hoek-lighter': 'Altyd sigarette, nooit ’n lighter nie, gee dié persoon ’n naam.',
  'choef-hoek-crowded': 'Wat noem jy dit wanneer die smoking area skielik meer crowded as die stage raak?',
  'dopstop-bankkaart': 'Daai oomblik wanneer iemand hulle bankkaart tap en net vir die beste hoop, watter woord pas?',
  'dopstop-rondte': 'Hulle koop nooit hulle eie rondte nie, maar drink altyd eerste. Gee dié persoon ’n naam.',
  'dopstop-verdwyn': 'Sodra dit hulle beurt is om te betaal, verdwyn hulle by die bar. Wat noem jy dié persoon?',
  'beats-blok-skouers': 'Iemand klim op iemander ander se skouers en dit veroorsaak dat die mense agter hulle nie kan sien nie. Watter woord pas?',
  'beats-blok-drinks': 'Een wilde dansmove later lê almal se drinks op die grond. Wat doop jy dié danser?',
  'beats-blok-screens': 'Wat noem jy dit wanneer jy só ver agter staan dat jy die hele show net op die screens kyk?',
}

export function officialPhraseText(phraseId: string, fallback = '') {
  return OFFICIAL_PHRASE_COPY[phraseId] ?? fallback
}
