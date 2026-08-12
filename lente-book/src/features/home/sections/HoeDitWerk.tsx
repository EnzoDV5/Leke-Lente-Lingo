import { useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '../../../components/ui/Section'
import Reveal from '../../../components/ui/Reveal'
import styles from './HoeDitWerk.module.css'

const MEGANIKA = [
  {
    id: 'woordeboek',
    nommer: '01',
    titel: 'Die Woordeboek',
    kort: 'Skep en stem vir nuwe woorde.',
    beskrywing: 'Kies ’n fees-scenario, dink die woord wat nog nie bestaan nie en plaas dit in die boek. Lees ander mense se voorstelle, steel en verbeter ’n idee, of stem die raakste woord boontoe.',
    to: '/woordeboek',
    aksie: 'Woordeboek',
    kleur: 'oranje',
  },
  {
    id: 'foto',
    nommer: '02',
    titel: 'Die Fotomuur',
    kort: 'Gee ’n feesoomblik sy eie naam.',
    beskrywing: 'Vang iets wat net by Lentedag kan gebeur, doop die foto met jou nuwe woord en voeg dit by die lewendige muur. Die foto gee konteks; die woord laat die oomblik voortleef.',
    to: '/foto',
    aksie: 'Foto',
    kleur: 'pienk',
  },
  {
    id: 'woordjag',
    nommer: '03',
    titel: 'Lente Bingo',
    kort: 'Soek posters en ontsluit uitdagings.',
    beskrywing: 'Beweeg deur die fees, vind die versteekte posters en skandeer hul QR-kodes. Elke poster maak ’n nuwe taal-uitdaging oop; voltooi die stel om die Wildcard te ontsluit.',
    to: '/woordjag',
    aksie: 'Bingo',
    kleur: 'groen',
  },
  {
    id: 'jaarwoord',
    nommer: '04',
    titel: 'Die Lente-woord',
    kort: 'Die gemeenskap kies die jaar se wenner.',
    beskrywing: 'Elke stem help die sterkste nuwe woord groei. Aan die einde word die voorstel met die meeste steun daardie jaar se Lente-woord, ’n klein stukkie taalgeskiedenis wat by die fees gebore is.',
    to: '/woordeboek',
    aksie: 'Stem',
    kleur: 'geel',
  },
]

export default function HoeDitWerk() {
  const [oop, setOop] = useState('woordeboek')

  return (
    <Section bg="paper" rondBo wydte="wyd" className={styles.section}>
      <div className={styles.layout}>
        <Reveal>
          <div className={styles.story}>
            <h2>
              <span>WAT IS</span><br />
              <span>LENTE</span><br />
              BOOK?
            </h2>
            <p className={styles.lead}>
              Elke lente maak Lente Book oop vir woorde wat nog nie bestaan nie.
            </p>
            <p>
              Feesgangers kry snaakse scenario’s en skep nuwe woorde daarvoor, taal wat soos lenteblomme by Lentedag ontstaan.
            </p>
            <p>
              Die fokus-taal verander elke jaar, maar almal mag altyd deelneem en woorde in hul eie taal uitdink.
            </p>
            <div className={styles.yearNote}>
              <strong>2026 · AFRIKAANS</strong>
              <span>Die woord met die meeste stemme word die Lente-woord van die jaar.</span>
            </div>
          </div>
        </Reveal>

        <div className={styles.accordions}>
          {MEGANIKA.map((item, index) => {
            const isOpen = oop === item.id
            return (
              <Reveal key={item.id} delay={index * 70}>
                <article className={`${styles.item} ${styles[item.kleur]} ${isOpen ? styles.open : ''}`}>
                  <div className={styles.itemHead}>
                    <button
                      type="button"
                      className={styles.toggle}
                      aria-expanded={isOpen}
                      aria-controls={`mechanic-${item.id}`}
                      onClick={() => setOop(isOpen ? '' : item.id)}
                    >
                      <span>
                        <strong>{item.titel}</strong>
                        <small>{item.kort}</small>
                      </span>
                      <i aria-hidden="true">{isOpen ? '×' : '+'}</i>
                    </button>
                  </div>

                  <div className={styles.answer} id={`mechanic-${item.id}`} aria-hidden={!isOpen}>
                    <div>
                      <p>{item.beskrywing}</p>
                      <Link className={styles.action} to={item.to} viewTransition>
                        {item.aksie}
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
