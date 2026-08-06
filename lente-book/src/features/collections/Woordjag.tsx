import { useState } from 'react'
import { jagkaarte as beginKaarte } from '../../lib/mockData'
import JagKaart from './JagKaart'
import styles from './Woordjag.module.css'

export default function Woordjag() {
  const [kaarte, setKaarte] = useState(beginKaarte)
  const versamel = kaarte.filter((k) => k.versamel).length
  const totaal = kaarte.length
  const almal = versamel === totaal

  const merk = (id: string) =>
    setKaarte(kaarte.map((k) => (k.id === id ? { ...k, versamel: !k.versamel } : k)))

  return (
    <section className={styles.wrap}>
      <header className={styles.kop}>
        <p className={styles.kicker}>★ Die Woordjag ★</p>
        <h1 className={styles.titel}>Die Woordjag</h1>
        <p className={styles.onder}>Soek die plakate, skan die QR-kodes, versamel al {totaal}!</p>
      </header>

      <div className={styles.tellers}>
        <div className={styles.teller}><span className={styles.tellerGetal}>{versamel} / {totaal}</span><span className={styles.tellerEtiket}>Versamel</span></div>
        <div className={`${styles.teller} ${styles.geel}`}><span className={styles.tellerGetal}>⚡ 47</span><span className={styles.tellerEtiket}>Voltooide jagters</span></div>
      </div>

      <div className={styles.balk}><div className={styles.vul} style={{ width: `${(versamel / totaal) * 100}%` }} /></div>

      <div className={styles.hoe}>
        <strong className={styles.hoeKop}>📖 Hoe dit werk</strong>
        <p className={styles.hoeText}>Tik ’n kaart om dit om te draai en die leidraad te sien. Kry die QR by die plakaat om die uitdaging te begin.</p>
      </div>

      <div className={styles.rooster}>
        {kaarte.map((k) => <JagKaart key={k.id} kaart={k} opMerk={() => merk(k.id)} />)}
      </div>

      <div className={`${styles.finale} ${almal ? styles.oop : ''}`}>
        <span className={styles.slot}>{almal ? '🔓' : '🔒'}</span>
        <div>
          <strong className={styles.finaleKop}>Finale Uitdaging — Die Wildcard</strong>
          <p className={styles.finaleText}>
            {almal
              ? 'Ontsluit! Skep jou eie scenario en jou eie woord — dit gaan live in die woordeboek.'
              : `Versamel al ${totaal} — dan is dié joune.`}
          </p>
        </div>
      </div>
    </section>
  )
}