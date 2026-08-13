import type { Foto, HoeStap, Frase, Jagkaart } from '../types'

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
  { nommer: 3, titel: 'Stem & wen', kleur: 'bg-groen text-ink',
    beskrywing: 'Stem vir die woord waarvan jy die meeste hou. Die woord met die meeste stemme word ’n liedjie ná die fees.' },
]

const LENTEDAG_WOORDE: Record<string, string> = {
  warm: 'Sitgloed', deur: 'Klopkans', twee: 'Hokkieduet',
  pull: 'Pofleen', ligter: 'Vlammaat', rook: 'Wolkplein',
  kaart: 'Saldohoop', rondte: 'Slukskof', verdwyn: 'Rondtespook',
  skouer: 'Skouermaan', dans: 'Morsritme', screen: 'Skermskou',
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
  { id: 'poep-pods-warm-seat', bord: 'Die Poep-Pods', area: 'bathroom', kleur: 'pienk', beskrywing: 'Wat noem jy daai ongemaklike gevoel wanneer die toilet seat nog warm is?', woorde: maakWoorde('warm', [['Boudbewys', '@lea_lente', 418], ['Sitspook', '@jaco_jol', 307], ['Warmnalatenskap', '@mila_mal', 221], ['Troonkoors', '@ben_beats', 146], ['Agterskok', '@zoe_za', 89]]) },
  { id: 'poep-pods-deure', bord: 'Die Poep-Pods', area: 'bathroom', kleur: 'pienk', beskrywing: 'Wat noem jy iemand wat elke toiletdeur probeer sonder om eers te klop?', woorde: maakWoorde('deur', [['Hokhopper', '@tika_mooi', 501], ['Knipklopper', '@rine_nag', 377], ['Deurdobbelaar', '@fees_flits', 264], ['Slotsoeker', '@cara_kom', 138]]) },
  { id: 'poep-pods-twee', bord: 'Die Poep-Pods', area: 'bathroom', kleur: 'pienk', beskrywing: 'Wat noem jy dit wanneer twee mense saam in een portable toilet probeer pas?', woorde: maakWoorde('twee', [['Dubbeldrom', '@nina_nag', 489], ['Hokkiehok', '@sam_sing', 332], ['Poep-pasmaat', '@leo_lawaai', 205], ['Troonprop', '@ava_aan', 117]]) },
  { id: 'choef-hoek-pull', bord: 'Die Choef-hoek', area: 'smoking', kleur: 'groen', beskrywing: 'Wat noem jy iemand wat nooit hulle eie choef bring nie, maar altyd vra vir ’n pull?', woorde: maakWoorde('pull', [['Trekparasiet', '@dani_dans', 532], ['Pofskollie', '@marc_mosh', 405], ['Choefskuld', '@ruby_ritme', 249], ['Longlener', '@kai_klank', 183], ['Wolkbedelaar', '@suri_son', 96]]) },
  { id: 'choef-hoek-lighter', bord: 'Die Choef-hoek', area: 'smoking', kleur: 'groen', beskrywing: 'Wat noem jy iemand wat altyd sigarette het, maar nooit ’n lighter nie?', woorde: maakWoorde('ligter', [['Vlamvergeet', '@theo_tune', 476], ['Kliklose', '@andi_aan', 318], ['Brandbedelaar', '@rene_reën', 230], ['Vuurvraer', '@kiki_kleur', 154]]) },
  { id: 'choef-hoek-crowded', bord: 'Die Choef-hoek', area: 'smoking', kleur: 'groen', beskrywing: 'Wat noem jy dit wanneer die smoking area meer crowded as die stage raak?', woorde: maakWoorde('rook', [['Rookskou', '@nico_nag', 619], ['Wolkwemel', '@faye_fees', 444], ['Pofpodium', '@luca_luid', 286], ['Choefchoor', '@zara_zing', 171]]) },
  { id: 'dopstop-bankkaart', bord: 'Die Dopstop', area: 'bar', kleur: 'goud', beskrywing: 'Wat noem jy iemand wat hulle bankkaart tik en hoop vir die beste?', woorde: maakWoorde('kaart', [['Tikgeloof', '@miela_lig', 703], ['Saldo-senuwee', '@bram_fees', 482], ['Kaartgebed', '@noah_nag', 359], ['Bankbluf', '@ethan_energie', 217], ['Tappiehoop', '@lize_lag', 128]]) },
  { id: 'dopstop-rondte', bord: 'Die Dopstop', area: 'bar', kleur: 'goud', beskrywing: 'Wat noem jy iemand wat nooit hulle eie rondte koop nie, maar altyd eerste drink?', woorde: maakWoorde('rondte', [['Rondterot', '@josh_jol', 588], ['Slukskelm', '@cara_kom', 421], ['Dopduiker', '@mia_musiek', 303], ['Glasgas', '@liam_lente', 175]]) },
  { id: 'dopstop-verdwyn', bord: 'Die Dopstop', area: 'bar', kleur: 'goud', beskrywing: 'Wat noem jy die persoon wat altyd by die bar verdwyn wanneer dit hulle beurt is om te betaal?', woorde: maakWoorde('verdwyn', [['Betaalspook', '@dansvloer_daan', 661], ['Rondtevlug', '@tika_mooi', 439], ['Tjektrekker', '@sophie_dans', 294], ['Dopverdamp', '@pieter_vleis', 190]]) },
  { id: 'beats-blok-skouers', bord: 'Die Beats Blok', area: 'stages', kleur: 'blou', beskrywing: 'Wat noem jy daai persoon wat op iemand se skouers klim en niemand agter hulle kan sien nie?', woorde: maakWoorde('skouer', [['Uitsigvreter', '@fees_flits', 745], ['Skouertoring', '@rine_nag', 536], ['Mensmuur', '@jaco_groot', 392], ['Kopskerm', '@zoe_za', 241], ['Verhoogversper', '@ben_beats', 139]]) },
  { id: 'beats-blok-drinks', bord: 'Die Beats Blok', area: 'stages', kleur: 'blou', beskrywing: 'Wat noem jy iemand wat almal se drinks uitstamp met hulle dansmoves?', woorde: maakWoorde('dans', [['Dopklapper', '@miela_lig', 682], ['Morsmosher', '@leo_lawaai', 497], ['Glaswaai', '@nina_nag', 315], ['Spatdans', '@sam_sing', 204]]) },
  { id: 'beats-blok-screens', bord: 'Die Beats Blok', area: 'stages', kleur: 'blou', beskrywing: 'Wat noem jy dit wanneer jy so ver agter staan dat jy net die screens kyk?', woorde: maakWoorde('screen', [['Skermfees', '@ava_aan', 576], ['Pixelpodium', '@ruby_ritme', 433], ['Verkyker-vibe', '@kai_klank', 278], ['Agterkonsert', '@suri_son', 166]]) },

  { id: 'wildcard-nuwe-vriende', bord: 'Wildcard-skeppings', area: 'stages', kleur: 'pers', createdByUsername: '@wild_mia', createdByAvatar: 'profile-7', beskrywing: 'Wat noem jy dit wanneer jou vriend verdwyn en terugkom met ’n hele nuwe vriendegroep?', woorde: maakWoorde('wild-vriende', [['Vriendverdubbel', '@wild_mia', 812], ['Groepgroei', '@plakkaatpro', 549], ['Maatmagneet', '@vyfgevind', 368], ['Kuddekeer', '@qr_koning', 211]]) },
  { id: 'wildcard-laaste-lied', bord: 'Wildcard-skeppings', area: 'stages', kleur: 'pers', createdByUsername: '@jagter_jay', createdByAvatar: 'profile-11', beskrywing: 'Wat noem jy iemand wat ná elke lied belowe dit is hulle laaste een?', woorde: maakWoorde('wild-lied', [['Laastelieg', '@jagter_jay', 769], ['Nogeenaar', '@scan_sam', 521], ['Totsiensdans', '@kaart_kat', 347], ['Encore-ontkenner', '@lente_liz', 186]]) },
  { id: 'wildcard-weggeraak', bord: 'Wildcard-skeppings', area: 'bar', kleur: 'pers', createdByUsername: '@wild_zoe', createdByAvatar: 'profile-16', beskrywing: 'Wat noem jy dit wanneer jy jou vriende verloor, maar presies weet waar die bar is?', woorde: maakWoorde('wild-bar', [['Maatloosrigting', '@wild_zoe', 721], ['Dopkompas', '@plakkaatpiet', 594], ['Barinstink', '@vyfster_vic', 403], ['Vriendverdwaal', '@qr_queen', 229]]) },
  { id: 'wildcard-uitrusting', bord: 'Wildcard-skeppings', area: 'stages', kleur: 'pers', createdByUsername: '@jagter_jo', createdByAvatar: 'profile-20', beskrywing: 'Wat noem jy ’n vreemdeling met presies dieselfde feesuitrusting as jy?', woorde: maakWoorde('wild-klere', [['Klereklong', '@jagter_jo', 688], ['Tweelingvreemd', '@scan_suri', 463], ['Stylmaat', '@kaart_kai', 351], ['Pas-pasmaat', '@lente_lea', 198]]) },
]

export const jagkaarte: Jagkaart[] = [
  { id: 'j1', naam: 'Groot Swartbord #1', tipe: 'Doop dit', tipeKleur: 'pienk', versamel: false,
    leidraad: 'Staan by die plek waar die fees begin en die oorweldiging eindig ,  die groot bord waar drome inspeel.' },
  { id: 'j2', naam: 'Roomyskraaltjie', tipe: 'Foto-doop', tipeKleur: 'groen', versamel: false,
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
