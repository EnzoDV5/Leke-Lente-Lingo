import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { frases } from '../../lib/mockData'
import { bgKleur, tekstKleur } from '../../lib/kleur'
import type { Woord } from '../../types'
import styles from './FraseView.module.css'

export default function FraseView() {
  const { id } = useParams()
  const frase = frases.find((f) => f.id === id)
  const [woorde, setWoorde] = useState<Woord[]>(frase ? frase.woorde : [])
  const [nuut, setNuut] = useState('')
  const [steel, setSteel] = useState<string | null>(null)

  if (!frase) {
    return (
      <div className={styles.wrap}>
        <Link to="/woordeboek" className={styles.terug}>← Terug na Woordeboek</Link>
        <p className={styles.leeg}>Hierdie frase bestaan nie.</p>
      </div>
    )
  }

  const gerangskik = [...woorde].sort((a, b) => b.stemme - a.stemme)

  const plaas = () => {
    const skoon = nuut.trim()
    if (!skoon) return
    setWoorde([...woorde, {
      id: `nuut-${Date.now()}`, woord: skoon, handle: '@jy', stemme: 1,
      ...(steel ? { verbeterVan: steel, verbeterDeur: '@jy' } : {}),
    }])
    setNuut(''); setSteel(null)
  }

  const stem = (wid: string) =>
    setWoorde(woorde.map((w) => (w.id === wid ? { ...w, stemme: w.stemme + 1 } : w)))

  return (
    <div className={styles.wrap}>
      <Link to="/woordeboek" className={styles.terug}>← Terug na Woordeboek</Link>

      <div className={styles.banier} style={{ background: bgKleur(frase.kleur), color: tekstKleur(frase.kleur) }}>
        <p className={styles.frase}>{frase.beskrywing}</p>
        <span className={styles.telling}>⚡ {woorde.length} woorde uitgedink</span>
      </div>

      <div className={styles.invoer}>
        <label className={styles.etiket}>{steel ? `Verbeter “${steel}”:` : 'Dink jou woord uit:'}</label>
        <div className={styles.invoerRy}>
          <input className={styles.veld} value={nuut} placeholder="Jou woord…"
            onChange={(e) => setNuut(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && plaas()} />
          <button className={styles.plaas} onClick={plaas}>Plaas!</button>
        </div>
        <span className={styles.as}>as @jy</span>
        {steel && <button className={styles.kanselleer} onClick={() => setSteel(null)}>× kanselleer steel</button>}
      </div>

      <h2 className={styles.alleKop}>Alle Woorde</h2>
      <ul className={styles.woordLys}>
        {gerangskik.map((w, i) => (
          <li key={w.id} className={styles.woordItem}>
            <div className={styles.rang}>{i === 0 ? '👑' : `#${i + 1}`}</div>
            <div className={styles.woordInfo}>
              <span className={styles.woordNaam}>{w.woord}</span>
              <span className={styles.woordMeta}>{w.handle}</span>
              {w.verbeterVan && <span className={styles.verbeter}>gesteel &amp; verbeter van “{w.verbeterVan}”</span>}
            </div>
            <button className={styles.steelKnop} onClick={() => { setSteel(w.woord); setNuut(w.woord) }}>Steel &amp; Verbeter</button>
            <button className={styles.stemKnop} onClick={() => stem(w.id)}>☆ {w.stemme}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}