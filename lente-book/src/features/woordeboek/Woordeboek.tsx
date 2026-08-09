import { useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from '../../components/ui/SearchBar'
import FilterTabs from '../../components/ui/FilterTabs'
import PhraseCard from '../../components/ui/PhraseCard'
import TopWordCard from '../../components/ui/TopWordCard'
import CompactHero from '../../components/ui/CompactHero'
import { frases } from '../../lib/mockData'
import styles from './Woordeboek.module.css'

const BORDE = [
  'Die Poep-Pods',
  'Die Choef-hoek',
  'Die Dopstop',
  'Die Beats Blok',
  'Wildcard-skeppings',
]

export default function Woordeboek() {
  const [soek, setSoek] = useState('')
  const [filter, setFilter] = useState('alles')
  const [visibleFilter, setVisibleFilter] = useState('alles')
  const [filterLeaving, setFilterLeaving] = useState(false)
  const filterTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(filterTimer.current), [])

  const changeFilter = (nextFilter: string) => {
    if (nextFilter === filter || filterLeaving) return

    setFilter(nextFilter)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisibleFilter(nextFilter)
      return
    }

    setFilterLeaving(true)
    filterTimer.current = window.setTimeout(() => {
      setVisibleFilter(nextFilter)
      setFilterLeaving(false)
    }, 300)
  }

  const gewys = useMemo(() => {
    const t = soek.toLowerCase()
    let lys = frases.filter((f) =>
      f.beskrywing.toLowerCase().includes(t) || f.woorde.some((w) => w.woord.toLowerCase().includes(t)))
    if (visibleFilter === 'top') {
      lys = [...lys].sort((a, b) =>
        Math.max(...b.woorde.map((w) => w.stemme), 0) - Math.max(...a.woorde.map((w) => w.stemme), 0))
    }
    return lys
  }, [soek, visibleFilter])

  const bordGroepe = BORDE.map((bord) => ({
    bord,
    frases: gewys.filter((frase) => frase.bord === bord),
  })).filter((groep) => groep.frases.length > 0)

  const topWords = useMemo(() => {
    const term = soek.toLowerCase()
    return frases
      .flatMap((phrase) => phrase.woorde.map((word) => ({ phrase, word })))
      .filter(({ phrase, word }) =>
        phrase.beskrywing.toLowerCase().includes(term) ||
        word.woord.toLowerCase().includes(term) ||
        word.handle.toLowerCase().includes(term),
      )
      .sort((a, b) => b.word.stemme - a.word.stemme)
      .slice(0, 30)
  }, [soek])

  return (
    <section className={styles.page}>
      <CompactHero
        kicker="★ Lente Book ★"
        title="Die Woordeboek"
        subtitle="Kies ’n frase ,  dink ’n woord ,  stem vir die beste"
      />

      <div className={styles.wrap}>
        <div className={styles.kontroles} data-scroll-reveal="up">
        <SearchBar waarde={soek} opVerander={setSoek} plekhouer="Soek ’n woord of frase…" />
        <FilterTabs aktief={filter} opKies={changeFilter}
          opsies={[{ sleutel: 'alles', etiket: 'Alles' }, { sleutel: 'top', etiket: 'Top Woorde ★' }]} />
        </div>

        <div
          key={visibleFilter}
          className={`${styles.lys} ${visibleFilter === 'top' ? styles.topLys : styles.allesLys} ${filterLeaving ? styles.lysLeaving : ''} ${filter === 'top' ? styles.naRegs : styles.naLinks}`}
        >
          {visibleFilter === 'top' ? (
            <section className={styles.topWoorde}>
              <div className={styles.topWoordeKop}>
                <span aria-hidden="true">🏆</span>
                <div><small>Regstreeks</small><h2>Top 30 Woorde</h2></div>
              </div>
              <div className={styles.topWoordeLys}>
                {topWords.map(({ phrase, word }, index) => (
                  <TopWordCard key={`${phrase.id}-${word.id}`} phrase={phrase} word={word} rank={index + 1} />
                ))}
              </div>
            </section>
          ) : bordGroepe.map((groep) => (
            <section className={styles.bordGroep} key={groep.bord}>
              <div className={styles.bordOpskrif}>
                <span aria-hidden="true">✦</span>
                <h2>{groep.bord}</h2>
                <small>{groep.frases.length} frases</small>
              </div>
              <div className={styles.bordFrases}>
                {groep.frases.map((frase) => (
                  <PhraseCard key={frase.id} frase={frase} />
                ))}
              </div>
            </section>
          ))}
          {(visibleFilter === 'top' ? topWords.length === 0 : gewys.length === 0) && <p className={styles.leeg}>Geen resultate pas by “{soek}” nie.</p>}
        </div>
      </div>
    </section>
  )
}
