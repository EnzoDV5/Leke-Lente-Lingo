import { useMemo, useState } from 'react'
import SearchBar from '../../components/ui/SearchBar'
import FilterTabs from '../../components/ui/FilterTabs'
import PhraseCard from '../../components/ui/PhraseCard'
import { frases } from '../../lib/mockData'
import styles from './Woordeboek.module.css'

export default function Woordeboek() {
  const [soek, setSoek] = useState('')
  const [filter, setFilter] = useState('alles')

  const gewys = useMemo(() => {
    const t = soek.toLowerCase()
    let lys = frases.filter((f) =>
      f.beskrywing.toLowerCase().includes(t) || f.woorde.some((w) => w.woord.toLowerCase().includes(t)))
    if (filter === 'top') {
      lys = [...lys].sort((a, b) =>
        Math.max(...b.woorde.map((w) => w.stemme), 0) - Math.max(...a.woorde.map((w) => w.stemme), 0))
    }
    return lys
  }, [soek, filter])

  return (
    <section className={styles.wrap}>
      <header className={styles.kop}>
        <p className={styles.kicker}>★ Lente Book ★</p>
        <h1 className={styles.titel}>Die Woordeboek</h1>
        <p className={styles.onder}>Kies ’n frase — dink ’n woord — stem vir die beste</p>
      </header>

      <div className={styles.kontroles}>
        <SearchBar waarde={soek} opVerander={setSoek} plekhouer="Soek ’n woord of frase…" />
        <FilterTabs aktief={filter} opKies={setFilter}
          opsies={[{ sleutel: 'alles', etiket: 'Alles' }, { sleutel: 'top', etiket: 'Top Woorde ★' }]} />
      </div>

      <div className={styles.lys}>
        {gewys.map((f) => <PhraseCard key={f.id} frase={f} />)}
        {gewys.length === 0 && <p className={styles.leeg}>Geen frases pas by “{soek}” nie.</p>}
      </div>
    </section>
  )
}