import type { Foto, HoeStap, Frase, Jagkaart } from '../types'
import { officialPhraseText } from './officialPhraseCopy'

export const WOORDE_GEPLAK = 12340

export const fotos: Foto[] = [
  { id: '1', woord: 'Skrappielag',  handle: '@dansvloer_daan', kleur: 'bg-pienk'    },
  { id: '2', woord: 'Pronkdans',    handle: '@miela_lig',      kleur: 'bg-goud'     },
  { id: '3', woord: 'Nananing',     handle: '@tika_mooi',      kleur: 'bg-groen'    },
  { id: '4', woord: 'Kyksog',       handle: '@dansvloer_daan', kleur: 'bg-blou'     },
  { id: '5', woord: 'Onklaargesig', handle: '@rine_nag',       kleur: 'bg-oranje'   },
  { id: '6', woord: 'Nep-luister',  handle: '@sophie_dans',    kleur: 'bg-pers'     },
  { id: '7', woord: 'Luidskaaf',    handle: '@pieter_vleis',   kleur: 'bg-sagpienk' },
  { id: '8', woord: 'Smeltdruppel', handle: '@bram_fees',      kleur: 'bg-groen'    },
]

export const hoeStappe: HoeStap[] = [
  { nommer: 1, titel: 'Vind ’n bord', kleur: 'bg-goud text-ink',
    beskrywing: 'Soek krytborde en posters regoor Lentedag ,  elkeen het ’n beskrywing van iets waarvoor Afrikaans nog nie ’n woord het nie.' },
  { nommer: 2, titel: 'Dink ’n woord', kleur: 'bg-pienk text-paper',
    beskrywing: 'Hoe sou JY dit noem? Skryf jou eie woord in. Die beskrywing is klaar ,  net die woord moet nog uitgedink word.' },
  { nommer: 3, titel: 'stem & wen', kleur: 'bg-groen text-ink',
    beskrywing: 'Gee die woord waarvan jy die meeste hou ’n stem. Die woord met die meeste stemme word ’n liedjie ná die fees.' },
]

const LENTEDAG_WOORDE: Record<string, string> = {
  warm: 'Sitgloed', deur: 'Klopkans', twee: 'Hokkieduet',
  pull: 'Pofleen', ligter: 'Vlammaat', rook: 'Wolkplein',
  kaart: 'Saldohoop', rondte: 'Slukskof', verdwyn: 'Rondtespook',
  skouer: 'Skouermaan', dans: 'Morsritme', screen: 'Skermskou', bass: 'Dreunslag',
  'wild-vriende': 'Maatpluk', 'wild-lied': 'Laastelus',
  'wild-bar': 'Dopradar', 'wild-klere': 'Stylspieël',
}

const maakWoorde = (
  prefix: string,
  entries: Array<[woord: string, handle: string, stemme: number]>,
) => {
  const basis = entries.map(([woord, handle, stemme], index) => ({
    id: `${prefix}-${index + 1}`,
    woord,
    handle,
    stemme,
  }))
  const sterte = ['koors', 'kriewel', 'kabaal', 'vonkel']
  const remixHandles = [
    '@woord_wurm',
    '@lente_lawaai',
    '@fees_fabriek',
    '@taal_towenaar',
  ]
  const remixes = entries.slice(0, 4).map(([woord, , stemme], index) => ({
    id: `${prefix}-remix-${index + 1}`,
    woord: `${woord}-${sterte[index]}`,
    handle: remixHandles[index],
    stemme: Math.max(24, Math.round(stemme * (0.22 - index * 0.035))),
    verbeterVan: woord,
    verbeterDeur: remixHandles[index],
  }))

  const lentedagWoord = {
    id: `${prefix}-lentedag`,
    woord: LENTEDAG_WOORDE[prefix] ?? 'Lentevonds',
    handle: '@lentedag',
    stemme: Math.max(72, Math.round(entries[0][2] * .38)),
  }

  return [...basis, lentedagWoord, ...remixes]
}

export const frases: Frase[] = [
  { id: 'poep-pods-warm-seat', bord: 'Die Poep-Pods', area: 'bathroom', kleur: 'pienk', beskrywing: officialPhraseText('poep-pods-warm-seat'), woorde: maakWoorde('warm', [['Boudbewys', '@lea_lente', 418], ['BoudBluetooth', '@tuks_tumi', 386], ['Sitspook', '@jaco_jol', 307], ['Seat-rebound', '@campus_kay', 273], ['Warmnalatenskap', '@mila_mal', 221], ['Eishkussing', '@pitori_papi', 184], ['Troonkoors', '@ben_beats', 146], ['Hittestempel', '@hatfield_hun', 119], ['Agterskok', '@zoe_za', 89], ['Vorige-eienaar-vibes', '@res_riaan', 61]]) },
  { id: 'poep-pods-deure', bord: 'Die Poep-Pods', area: 'bathroom', kleur: 'pienk', beskrywing: officialPhraseText('poep-pods-deure'), woorde: maakWoorde('deur', [['Hokhopper', '@tika_mooi', 501], ['Pisboks-paparazzi', '@jol_jess', 456], ['Knipklopper', '@rine_nag', 377], ['Klopallergie', '@varsity_vusi', 319], ['Deurdobbelaar', '@fees_flits', 264], ['Cubicle-crawler', '@campus_kay', 216], ['Hayi-bo-hopper', '@mamelodi_mo', 174], ['Slotsoeker', '@cara_kom', 138], ['Privaatheid-profeet', '@res_riaan', 92]]) },
  { id: 'poep-pods-twee', bord: 'Die Poep-Pods', area: 'bathroom', kleur: 'pienk', beskrywing: officialPhraseText('poep-pods-twee'), woorde: maakWoorde('twee', [['Dubbeldrom', '@nina_nag', 489], ['Boud-Tetris', '@tuks_tumi', 451], ['Hokkiehok', '@sam_sing', 332], ['Kakhuiskamasutra', '@hatfield_hun', 296], ['Poep-pasmaat', '@leo_lawaai', 205], ['Two-man-troon', '@campus_kay', 178], ['Dubbeldekker-drol', '@pitori_papi', 149], ['Queue-quickie', '@jol_jess', 126], ['Troonprop', '@ava_aan', 117]]) },
  { id: 'choef-hoek-pull', bord: 'Die Choef-hoek', area: 'smoking', kleur: 'groen', beskrywing: officialPhraseText('choef-hoek-pull'), woorde: maakWoorde('pull', [['Trekparasiet', '@dani_dans', 532], ['Choefbelasting', '@tuks_tumi', 471], ['Pofskollie', '@marc_mosh', 405], ['Puff-parasite', '@campus_kay', 346], ['Ngicela-ninja', '@varsity_vusi', 301], ['Choefskuld', '@ruby_ritme', 249], ['Long-lease', '@res_riaan', 214], ['Longlener', '@kai_klank', 183], ['Trektokkie', '@pitori_papi', 137], ['Wolkbedelaar', '@suri_son', 96]]) },
  { id: 'choef-hoek-lighter', bord: 'Die Choef-hoek', area: 'smoking', kleur: 'groen', beskrywing: officialPhraseText('choef-hoek-lighter'), woorde: maakWoorde('ligter', [['Vlamvergeet', '@theo_tune', 476], ['Vonkparasiet', '@jol_jess', 429], ['Kliklose', '@andi_aan', 318], ['Flame-freeloader', '@campus_kay', 281], ['Ke-kopa-klik', '@mamelodi_mo', 246], ['Brandbedelaar', '@rene_reën', 230], ['BIC-bedelaar', '@hatfield_hun', 197], ['Vuurvraer', '@kiki_kleur', 154], ['Lighterloos-lawaai', '@res_riaan', 112]]) },
  { id: 'choef-hoek-crowded', bord: 'Die Choef-hoek', area: 'smoking', kleur: 'groen', beskrywing: officialPhraseText('choef-hoek-crowded'), woorde: maakWoorde('rook', [['Rookskou', '@nico_nag', 619], ['Choefchurch', '@tuks_tumi', 571], ['Wolkwemel', '@faye_fees', 444], ['Nicotine-networking', '@campus_kay', 399], ['Pofparlement', '@varsity_vusi', 338], ['Pofpodium', '@luca_luid', 286], ['Wolkseminaar', '@mamelodi_mo', 241], ['Longkongres', '@hatfield_hun', 198], ['Choefchoor', '@zara_zing', 171], ['Eish-opeenhoping', '@pitori_papi', 126]]) },
  { id: 'dopstop-bankkaart', bord: 'Die Dopstop', area: 'bar', kleur: 'goud', beskrywing: officialPhraseText('dopstop-bankkaart'), woorde: maakWoorde('kaart', [['Tikgeloof', '@miela_lig', 703], ['Tap-en-bid', '@tuks_tumi', 637], ['Saldo-senuwee', '@bram_fees', 482], ['Saldo-roulette', '@jol_jess', 441], ['Kaartgebed', '@noah_nag', 359], ['Decline-dans', '@campus_kay', 304], ['Tšhelete-twyfel', '@mamelodi_mo', 267], ['Bankbluf', '@ethan_energie', 217], ['Fok-it-fonds', '@hatfield_hun', 183], ['Tappiehoop', '@lize_lag', 128]]) },
  { id: 'dopstop-rondte', bord: 'Die Dopstop', area: 'bar', kleur: 'goud', beskrywing: officialPhraseText('dopstop-rondte'), woorde: maakWoorde('rondte', [['Rondterot', '@josh_jol', 588], ['Rondteweeskind', '@tuks_tumi', 534], ['Slukskelm', '@cara_kom', 421], ['Sip-and-skip', '@campus_kay', 376], ['Dopkommunis', '@varsity_vusi', 329], ['Dopduiker', '@mia_musiek', 303], ['Suipspons', '@hatfield_hun', 251], ['Ngicela-net-een', '@mamelodi_mo', 217], ['Glasgas', '@liam_lente', 175], ['My-wallet-is-in-die-tent', '@res_riaan', 119]]) },
  { id: 'dopstop-verdwyn', bord: 'Die Dopstop', area: 'bar', kleur: 'goud', beskrywing: officialPhraseText('dopstop-verdwyn'), woorde: maakWoorde('verdwyn', [['Betaalspook', '@dansvloer_daan', 661], ['Imali-ghost', '@tuks_tumi', 603], ['Rondtevlug', '@tika_mooi', 439], ['Bill-Houdini', '@campus_kay', 391], ['Tjektrekker', '@sophie_dans', 294], ['Betaal-Bermuda', '@jol_jess', 257], ['Aowa-account', '@mamelodi_mo', 224], ['Dopverdamp', '@pieter_vleis', 190], ['Wallet-witness-protection', '@res_riaan', 148], ['Nou-sien-jy-my-nie', '@hatfield_hun', 101]]) },
  { id: 'beats-blok-skouers', bord: 'Die Beats Blok', area: 'stages', kleur: 'blou', beskrywing: officialPhraseText('beats-blok-skouers'), woorde: maakWoorde('skouer', [['Uitsigvreter', '@fees_flits', 745], ['Mens-selfiestok', '@tuks_tumi', 674], ['Skouertoring', '@rine_nag', 536], ['Stage-eclipse', '@campus_kay', 487], ['Mensmuur', '@jaco_groot', 392], ['Uitsigkolonis', '@varsity_vusi', 341], ['Main-character-muur', '@jol_jess', 298], ['Kopskerm', '@zoe_za', 241], ['Hayi-bo-hoëveld', '@mamelodi_mo', 186], ['Verhoogversper', '@ben_beats', 139]]) },
  { id: 'beats-blok-drinks', bord: 'Die Beats Blok', area: 'stages', kleur: 'blou', beskrywing: officialPhraseText('beats-blok-drinks'), woorde: maakWoorde('dans', [['Dopklapper', '@miela_lig', 682], ['Dopdonder', '@tuks_tumi', 625], ['Morsmosher', '@leo_lawaai', 497], ['Cup-assassin', '@campus_kay', 452], ['Glaswaai', '@nina_nag', 315], ['Spilliam-Shakespeare', '@jol_jess', 279], ['Sokkie-saboteur', '@varsity_vusi', 243], ['Spatdans', '@sam_sing', 204], ['Bekerbreaker', '@hatfield_hun', 167], ['Eish-my-brannas', '@pitori_papi', 113]]) },
  { id: 'beats-blok-screens', bord: 'Die Beats Blok', area: 'stages', kleur: 'blou', beskrywing: officialPhraseText('beats-blok-screens'), woorde: maakWoorde('screen', [['Skermfees', '@ava_aan', 576], ['YouTube-live-live', '@tuks_tumi', 521], ['Pixelpodium', '@ruby_ritme', 433], ['Backrow-broadband', '@campus_kay', 387], ['Skermtoeris', '@varsity_vusi', 326], ['Verkyker-vibe', '@kai_klank', 278], ['Pixelpeasant', '@jol_jess', 236], ['Data-date', '@mamelodi_mo', 194], ['Agterkonsert', '@suri_son', 166], ['Fok-my-data', '@hatfield_hun', 121]]) },
  { id: 'beats-blok-bass', bord: 'Die Beats Blok', area: 'stages', kleur: 'blou', beskrywing: officialPhraseText('beats-blok-bass'), woorde: maakWoorde('bass', [['Bassbewe', '@miela_lig', 758], ['Subwoofer-sidder', '@tuks_tumi', 693], ['Dreunbibber', '@jaco_groot', 561], ['Bass-drop-bloed', '@campus_kay', 512], ['Vibrasie-vonk', '@varsity_vusi', 437], ['Klankgolf-koors', '@mamelodi_mo', 378], ['Sub-slag', '@jol_jess', 322], ['Dopdreuning', '@zoe_za', 266], ['Eish-my-drankie-dans', '@hatfield_hun', 201], ['Bass-bibbertjie', '@pitori_papi', 148]]) },

  { id: 'wildcard-nuwe-vriende', bord: 'Wildcard-skeppings', area: 'stages', kleur: 'pers', createdByUsername: '@wild_mia', createdByAvatar: 'profile-7', beskrywing: 'Wat noem jy dit wanneer jou vriend verdwyn en terugkom met ’n hele nuwe vriendegroep?', woorde: maakWoorde('wild-vriende', [['Vriendverdubbel', '@wild_mia', 812], ['Maatinflasie', '@tuks_tumi', 646], ['Groepgroei', '@plakkaatpro', 549], ['Friendship-DLC', '@campus_kay', 492], ['Tsala-tsunami', '@mamelodi_mo', 417], ['Maatmagneet', '@vyfgevind', 368], ['Sidequest-squad', '@jol_jess', 302], ['Kuddekeer', '@qr_koning', 211], ['Social-respawn', '@varsity_vusi', 174]]) },
  { id: 'wildcard-laaste-lied', bord: 'Wildcard-skeppings', area: 'stages', kleur: 'pers', createdByUsername: '@jagter_jay', createdByAvatar: 'profile-11', beskrywing: 'Wat noem jy iemand wat ná elke lied belowe dit is hulle laaste een?', woorde: maakWoorde('wild-lied', [['Laastelieg', '@jagter_jay', 769], ['Laaste-een-leuen', '@tuks_tumi', 654], ['Nogeenaar', '@scan_sam', 521], ['Encore-addict', '@campus_kay', 468], ['Final-final-final', '@jol_jess', 396], ['Totsiensdans', '@kaart_kat', 347], ['One-more-merchant', '@varsity_vusi', 284], ['Encore-ontkenner', '@lente_liz', 186], ['Môre-se-probleem', '@hatfield_hun', 143]]) },
  { id: 'wildcard-weggeraak', bord: 'Wildcard-skeppings', area: 'bar', kleur: 'pers', createdByUsername: '@wild_zoe', createdByAvatar: 'profile-16', beskrywing: 'Wat noem jy dit wanneer jy jou vriende verloor, maar presies weet waar die bar is?', woorde: maakWoorde('wild-bar', [['Maatloosrigting', '@wild_zoe', 721], ['Dop-GPS', '@tuks_tumi', 648], ['Dopkompas', '@plakkaatpiet', 594], ['Tequila-telemetry', '@campus_kay', 511], ['Barinstink', '@vyfster_vic', 403], ['Maatlose-missie', '@jol_jess', 351], ['Aowa-ek-ken-die-pad', '@mamelodi_mo', 307], ['Vriendverdwaal', '@qr_queen', 229], ['Bar-magnetism', '@varsity_vusi', 181]]) },
  { id: 'wildcard-uitrusting', bord: 'Wildcard-skeppings', area: 'stages', kleur: 'pers', createdByUsername: '@jagter_jo', createdByAvatar: 'profile-20', beskrywing: 'Wat noem jy ’n vreemdeling met presies dieselfde feesuitrusting as jy?', woorde: maakWoorde('wild-klere', [['Klereklong', '@jagter_jo', 688], ['Klere-kloon', '@tuks_tumi', 621], ['Tweelingvreemd', '@scan_suri', 463], ['Outfit-collision', '@campus_kay', 418], ['Temu-tweeling', '@jol_jess', 374], ['Stylmaat', '@kaart_kai', 351], ['Drip-dubbelganger', '@varsity_vusi', 296], ['Pas-pasmaat', '@lente_lea', 198], ['Hayi-bo-haute-couture', '@mamelodi_mo', 151]]) },
]

// One canonical dummy ranking shared by the Woordeboek, the homepage podium,
// phrase cards and decorative word displays. Keeping the phrase + word pair
// together prevents fallback handles, vote totals and routes from drifting.
export const mockRankedWords = frases
  .flatMap((phrase) => phrase.woorde.map((word) => ({ phrase, word })))
  .sort((first, second) => second.word.stemme - first.word.stemme)

export const jagkaarte: Jagkaart[] = [
  { id: 'j1', naam: 'Groot Swartbord #1', tipe: 'Doop dit', tipeKleur: 'pienk', versamel: false,
    leidraad: 'Staan by die plek waar die fees begin en die oorweldiging eindig ,  die groot bord waar drome inspeel.' },
  { id: 'j2', naam: 'Roomyskraaltjie', tipe: 'Kiekie die Oomblik', tipeKleur: 'groen', versamel: false,
    leidraad: 'Naby waar soet-en-suiker mekaar ontmoet ,  soek die persoon met die roomys op die arms.' },
  { id: 'j3', naam: 'Dansbord A', tipe: 'Stem', tipeKleur: 'blou', versamel: false,
    leidraad: 'Waar die base jou borskas laat bibber en jou voete voor jou kop besluit ,  luidsprekers links.' },
  { id: 'j4', naam: 'Lente Bar', tipe: 'Doop dit', tipeKleur: 'pienk', versamel: false,
    leidraad: 'Waar die rye lank is en die geduld kort ,  soek die bord langs die tap.' },
  { id: 'j5', naam: 'Toilet-tou', tipe: 'Steel & Verbeter', tipeKleur: 'goud', versamel: false,
    leidraad: 'Die plek van die ewige wag ,  waar die giggel-groepe saamdrom.' },
  { id: 'j6', naam: 'Verhoog-hoek', tipe: 'Raai die Lingo', tipeKleur: 'pers', versamel: false,
    leidraad: 'By die hoek waar almal die kunstenaar wil sien maar niemand het plek nie.' },
]
