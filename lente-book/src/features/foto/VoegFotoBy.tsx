import { useState } from 'react'
import styles from './VoegFotoBy.module.css'

type Plasing = { id: string; url: string; woord: string }

export default function VoegFotoBy() {
  const [prent, setPrent] = useState<string | null>(null)
  const [woord, setWoord] = useState('')
  const [muur, setMuur] = useState<Plasing[]>([])

  const kies = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lêer = e.target.files?.[0]
    if (!lêer) return
    const leser = new FileReader()
    leser.onload = () => setPrent(leser.result as string)
    leser.readAsDataURL(lêer)
  }

  const plaas = () => {
    if (!prent || !woord.trim()) return
    setMuur([{ id: `${Date.now()}`, url: prent, woord: woord.trim() }, ...muur])
    setPrent(null); setWoord('')
  }

  return (
    <section className={styles.wrap}>
      <header className={styles.kop}>
        <p className={styles.kicker}>★ Foto-doop ★</p>
        <h1 className={styles.titel}>Voeg ’n Foto By</h1>
        <p className={styles.onder}>Vang die oomblik, gee dit ’n woord — dit gaan op die Lentedag muur.</p>
      </header>

      <div className={styles.kaart}>
        <label className={styles.dropzone}>
          {prent
            ? <img src={prent} alt="voorskou" className={styles.voorskou} />
            : <span className={styles.dropTeks}>📸<br />Tik om ’n foto te kies</span>}
          <input type="file" accept="image/*" onChange={kies} className={styles.versteek} />
        </label>

        <input className={styles.veld} value={woord} placeholder="Gee dit ’n woord…"
          onChange={(e) => setWoord(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && plaas()} />
        <span className={styles.as}>as @jy</span>

        <button className={styles.plaas} onClick={plaas} disabled={!prent || !woord.trim()}>Plaas op die muur →</button>
      </div>

      {muur.length > 0 && (
        <>
          <h2 className={styles.muurKop}>Op die muur</h2>
          <div className={styles.muur}>
            {muur.map((p, i) => (
              <figure key={p.id} className={styles.polaroid} style={{ transform: `rotate(${(i % 3) - 1}deg)` }}>
                <img src={p.url} alt={p.woord} className={styles.foto} />
                <figcaption className={styles.byskrif}>{p.woord}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </section>
  )
}