const LIG_TEKS = new Set(['oranje', 'blou', 'pers', 'pienk'])
export const tekstKleur = (kleur: string) => (LIG_TEKS.has(kleur) ? 'var(--color-paper)' : 'var(--color-ink)')
export const bgKleur = (kleur: string) => `var(--color-${kleur})`