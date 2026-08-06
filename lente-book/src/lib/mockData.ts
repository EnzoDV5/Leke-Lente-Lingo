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
    beskrywing: 'Soek krytborde en plakate regoor Lentedag — elkeen het ’n beskrywing van iets waarvoor Afrikaans nog nie ’n woord het nie.' },
  { nommer: 2, titel: 'Dink ’n woord', kleur: 'bg-pienk text-paper',
    beskrywing: 'Hoe sou JY dit noem? Skryf jou eie woord in. Die beskrywing is klaar — net die woord moet nog uitgedink word.' },
  { nommer: 3, titel: 'Stem & wen', kleur: 'bg-groen text-ink',
    beskrywing: 'Stem vir die woord waarvan jy die meeste hou. Die woord met die meeste stemme word ’n liedjie ná die fees.' },
]

export const frases: Frase[] = [
  { id: 'chip', kleur: 'oranje',
    beskrywing: 'Die gevoel wanneer jy ’n chip eet en dit klink so hard dat almal na jou kyk',
    woorde: [
      { id: 'c1', woord: 'Skrappielag', handle: '@dansvloer_daan', stemme: 342 },
      { id: 'c2', woord: 'Knersbaan', handle: '@tika_mooi', stemme: 198 },
      { id: 'c3', woord: 'Knersbaan-Koort', handle: '@sophie_dans', stemme: 87, verbeterVan: 'Knersbaan', verbeterDeur: '@sophie_dans' },
      { id: 'c4', woord: 'Luidskaaf', handle: '@pieter_vleis', stemme: 81 },
    ] },
  { id: 'luister', kleur: 'blou',
    beskrywing: 'Wanneer jy voorgee jy luister maar eintlik net wag vir jou beurt om te praat',
    woorde: [
      { id: 'l1', woord: 'Nep-luister', handle: '@sophie_dans', stemme: 289 },
      { id: 'l2', woord: 'Wagpraat', handle: '@bram_fees', stemme: 143 },
    ] },
  { id: 'roomys', kleur: 'pers',
    beskrywing: 'Die spesifieke hartseer wanneer ’n roomys op jou hand drup voor jy ’n hap kry',
    woorde: [
      { id: 'r1', woord: 'Smeltdruppelhartseer', handle: '@bram_fees', stemme: 412 },
      { id: 'r2', woord: 'Drupverlies', handle: '@miela_lig', stemme: 96 },
    ] },
  { id: 'nana', kleur: 'goud',
    beskrywing: 'Wanneer jy ’n liedjie ken maar net die na-na-na gedeelte kan sing',
    woorde: [
      { id: 'n1', woord: 'Nananing', handle: '@tika_mooi', stemme: 567 },
      { id: 'n2', woord: 'Neurie-gaping', handle: '@rine_nag', stemme: 112 },
    ] },
  { id: 'kyk', kleur: 'groen',
    beskrywing: 'Wanneer jy dans asof niemand kyk maar eintlik hoop hulle kyk almal',
    woorde: [
      { id: 'k1', woord: 'Pronkdans', handle: '@miela_lig', stemme: 623 },
      { id: 'k2', woord: 'Kyksog', handle: '@dansvloer_daan', stemme: 201 },
    ] },
  { id: 'foto', kleur: 'pienk',
    beskrywing: 'Die spesifieke gesig wat jy trek wanneer iemand ’n foto van jou neem sonder waarskuwing',
    woorde: [
      { id: 'f1', woord: 'Onklaargesiggies', handle: '@rine_nag', stemme: 445 },
      { id: 'f2', woord: 'Skriksnap', handle: '@jaco_groot', stemme: 88 },
    ] },
]

export const jagkaarte: Jagkaart[] = [
  { id: 'j1', naam: 'Groot Swartbord #1', tipe: 'Doop dit', tipeKleur: 'pienk', versamel: false,
    leidraad: 'Staan by die plek waar die fees begin en die oorweldiging eindig — die groot bord waar drome inspeel.' },
  { id: 'j2', naam: 'Roomyskraaltjie', tipe: 'Foto-doop', tipeKleur: 'groen', versamel: false,
    leidraad: 'Naby waar soet-en-suiker mekaar ontmoet — soek die persoon met die roomys op die arms.' },
  { id: 'j3', naam: 'Dansbord A', tipe: 'Stem', tipeKleur: 'blou', versamel: false,
    leidraad: 'Waar die base jou borskas laat bibber en jou voete voor jou kop besluit — luidsprekers links.' },
  { id: 'j4', naam: 'Lente Bar', tipe: 'Doop dit', tipeKleur: 'pienk', versamel: false,
    leidraad: 'Waar die rye lank is en die geduld kort — soek die bord langs die tap.' },
  { id: 'j5', naam: 'Toilet-tou', tipe: 'Steel & Verbeter', tipeKleur: 'goud', versamel: false,
    leidraad: 'Die plek van die ewige wag — waar die giggel-groepe saamdrom.' },
  { id: 'j6', naam: 'Verhoog-hoek', tipe: 'Raai die woord', tipeKleur: 'pers', versamel: false,
    leidraad: 'By die hoek waar almal die kunstenaar wil sien maar niemand het plek nie.' },
]