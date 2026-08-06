import { useState } from 'react'
import { bgKleur, tekstKleur } from '../../lib/kleur'
import type { Jagkaart } from '../../types'
import styles from './JagKaart.module.css'

export default function JagKaart({ kaart, opMerk }: { kaart: Jagkaart; opMerk: () => void }) {
  const [gedraai, setGedraai] = useState(false)
  return (
    <div className={styles.perspektief}>
      <div className={`${styles.kaart} ${gedraai ? styles.gedraai : ''} ${kaart.versamel ? styles.klaar : ''}`}>
        <button className={styles.kant} onClick={() => setGedraai(true)}>
          <span className={styles.tag} style={{ background: bgKleur(kaart.tipeKleur), color: tekstKleur(kaart.tipeKleur) }}>{kaart.tipe}</span>
          <span className={styles.naam}>{kaart.naam}</span>
          {kaart.versamel && <span className={styles.merkie}>✓ Versamel</span>}
          <span className={styles.wenk}>Tik om leidraad te sien</span>
        </button>
        <div className={`${styles.kant} ${styles.agter}`}>
          <p className={styles.leidraad}>“{kaart.leidraad}”</p>
          <button className={styles.merkKnop} onClick={opMerk}>{kaart.versamel ? 'Onmerk' : 'Merk as versamel'}</button>
          <button className={styles.draaiTerug} onClick={() => setGedraai(false)}>Tik om terug te draai</button>
        </div>
      </div>
    </div>
  )
}