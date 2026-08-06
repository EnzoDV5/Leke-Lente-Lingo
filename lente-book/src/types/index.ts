export type Foto = { id: string; woord: string; handle: string; kleur: string }

export type HoeStap = { nommer: number; titel: string; beskrywing: string; kleur: string }

export type Woord = {
  id: string
  woord: string
  handle: string
  stemme: number
  verbeterVan?: string   // original word text, if this is a steal-and-improve
  verbeterDeur?: string  // handle that improved it
}

export type Frase = {
  id: string
  beskrywing: string
  kleur: string          // token name: oranje | blou | pers | goud | groen | pienk | sagpienk
  woorde: Woord[]
}

export type Jagkaart = {
  id: string
  naam: string
  tipe: string
  tipeKleur: string      // token name for the tag
  leidraad: string
  versamel: boolean
}