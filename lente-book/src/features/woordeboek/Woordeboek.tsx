import { useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from '../../components/ui/SearchBar'
import FilterTabs from '../../components/ui/FilterTabs'
import PhraseCard from '../../components/ui/PhraseCard'
import TopWordCard from '../../components/ui/TopWordCard'
import CompactHero from '../../components/ui/CompactHero'
import { frases } from '../../lib/mockData'
import toiletIkoon from '../../assets/elements/poster elements/toilet-icon.webp'
import bekerIkoon from '../../assets/elements/poster elements/cup-icon.webp'
import luidsprekerIkoon from '../../assets/elements/poster elements/speaker-icon.webp'
import vapeIkoon from '../../assets/elements/poster elements/vape.webp'
import wildKaartIkoon from '../../assets/elements/poster titels/WILD CARD 2.webp'
import styles from './Woordeboek.module.css'

const BORDE = [
  'Die Poep-Pods',
  'Die Choef-hoek',
  'Die Dopstop',
  'Die Beats Blok',
  'Wildcard-skeppings',
]

// Poster-element badges per bord, matched to the festival area they live in.
const BORD_IKONE: Partial<Record<string, string>> = {
  'Die Poep-Pods': toiletIkoon,
  'Die Choef-hoek': vapeIkoon,
  'Die Dopstop': bekerIkoon,
  'Die Beats Blok': luidsprekerIkoon,
  'Wildcard-skeppings': wildKaartIkoon,
}

export default function Woordeboek() {
  const [soek, setSoek] = useState('')
  const [filter, setFilter] = useState('alles')
  const [visibleFilter, setVisibleFilter] = useState('alles')
  const [filterLeaving, setFilterLeaving] = useState(false)
  const filterTimer = useRef(0)
  const enteredOnce = useRef(false)
  const isFirstReveal = !enteredOnce.current
  const wrapRef = useRef<HTMLDivElement>(null)
  const lysRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    enteredOnce.current = true
  }, [])

  useEffect(() => () => window.clearTimeout(filterTimer.current), [])

  // Scroll-triggered reveal for the phrase groups (category sections + the
  // Top Woorde block): below-the-fold groups fade in as they're scrolled
  // into view instead of all animating together on mount. The very first
  // reveal additionally waits for --route-motion-delay (the same value the
  // hero copy in CompactHero uses) so groups already in view don't settle
  // before the hero-divider transition finishes.
  useEffect(() => {
    const groups = lysRef.current
      ? Array.from(lysRef.current.querySelectorAll<HTMLElement>('[data-reveal-group]'))
      : []
    if (!groups.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      groups.forEach((el) => el.classList.add(styles.groepRevealed))
      return
    }

    let observer: IntersectionObserver | undefined

    const observeGroups = () => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add(styles.groepRevealed)
            observer?.unobserve(entry.target)
          })
        },
        { threshold: 0.01, rootMargin: '0px 0px -4% 0px' },
      )
      groups.forEach((el) => {
        const isTopWordsGroup = visibleFilter === 'top'
        const isAlreadyOnScreen = el.getBoundingClientRect().top < window.innerHeight * .96

        if (isTopWordsGroup || isAlreadyOnScreen) {
          el.classList.add(styles.groepRevealed)
          return
        }

        observer!.observe(el)
      })
    }

    const delay = isFirstReveal
      ? parseFloat(
          getComputedStyle(wrapRef.current ?? document.documentElement).getPropertyValue('--route-motion-delay'),
        ) || 0
      : 0

    const timer = window.setTimeout(observeGroups, delay)

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleFilter, soek])

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
        subtitle="Kies ’n frase, dink ’n woord en gee die beste een ’n stem"
      />

      <div className={styles.wrap} data-no-auto-reveal ref={wrapRef}>
        <div className={`${styles.kontroles} ${isFirstReveal ? styles.kontrolesFirstReveal : ''}`}>
        <SearchBar waarde={soek} opVerander={setSoek} plekhouer="Soek ’n woord of frase…" />
        <FilterTabs aktief={filter} opKies={changeFilter}
          opsies={[{ sleutel: 'alles', etiket: 'Alles' }, { sleutel: 'top', etiket: 'Top Woorde ★' }]} />
        </div>

        <div
          key={visibleFilter}
          ref={lysRef}
          className={`${styles.lys} ${visibleFilter === 'top' ? styles.topLys : styles.allesLys} ${filterLeaving ? styles.lysLeaving : ''} ${filter === 'top' ? styles.naRegs : styles.naLinks}`}
        >
          {visibleFilter === 'top' ? (
            <section className={`${styles.topWoorde} ${styles.revealGroup}`} data-reveal-group>
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
            <section className={`${styles.bordGroep} ${styles.revealGroup}`} data-reveal-group key={groep.bord}>
              <div className={styles.bordOpskrif}>
                {BORD_IKONE[groep.bord] ? (
                  <img className={styles.bordIkoon} src={BORD_IKONE[groep.bord]} alt="" aria-hidden="true" />
                ) : (
                  <span className={styles.bordSter} aria-hidden="true">✦</span>
                )}
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
