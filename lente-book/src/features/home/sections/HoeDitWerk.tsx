import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '../../../components/ui/Section'
import Reveal from '../../../components/ui/Reveal'
import mouthElement from '../../../assets/elements/poster elements/Mouth.webp'
import speakerPhoneElement from '../../../assets/elements/poster elements/Speaker Phone.webp'
import singersElement from '../../../assets/elements/Singers.webp'
import styles from './HoeDitWerk.module.css'
import { useCampaign } from '../../campaign/CampaignProvider'

type MeganikaItem = {
  id: string
  nommer: string
  titel: string
  kort: string
  beskrywing: string
  kleur: string
  to?: string
  aksie?: string
}

const MEGANIKA: MeganikaItem[] = [
  {
    id: 'woordeboek',
    nommer: '01',
    titel: 'Die Woordeboek',
    kort: 'Skep nuwe woorde en gee stemme.',
    beskrywing: 'Kies ’n fees-scenario, dink die woord wat nog nie bestaan nie en sit dit in die boek. Lees ander mense se voorstelle, steel en verbeter ’n idee, of gee die raakste woord ’n stem.',
    to: '/woordeboek',
    aksie: 'Woordeboek',
    kleur: 'oranje',
  },
  {
    id: 'foto',
    nommer: '02',
    titel: 'Die Oomblikmuur',
    kort: 'Gee ’n feesoomblik sy eie naam.',
    beskrywing: 'Vang iets wat net by Lentedag kan gebeur, doop die foto met jou nuwe woord en voeg dit by die lewendige muur. Die foto gee konteks; die woord laat die oomblik voortleef.',
    to: '/foto',
    aksie: 'Foto',
    kleur: 'pienk',
  },
  {
    id: 'collections',
    nommer: '03',
    titel: 'Lente Bingo',
    kort: 'Soek posters en ontsluit uitdagings.',
    beskrywing: 'Beweeg deur die fees, vind die versteekte posters en skandeer hul QR-kodes. Elke poster maak ’n nuwe taal-uitdaging oop; voltooi die stel om die Wildcard te ontsluit.',
    to: '/collections',
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
    aksie: 'stem',
    kleur: 'geel',
  },
]

const PRE_MEGANIKA: MeganikaItem[] = [
  {
    id: 'eerste-frases',
    nommer: '01',
    titel: 'Kies ’n frase',
    kort: 'Vier feesoomblikke wag vir hul eerste woorde.',
    beskrywing: 'Kies een van die vier scenario’s op die tuisblad. Elke scenario kom uit ’n ander deel van die fees en beskryf ’n oomblik waarvoor daar nog nie die perfekte woord bestaan nie.',
    kleur: 'oranje',
  },
  {
    id: 'skep-woord',
    nommer: '02',
    titel: 'Skep of verbeter ’n woord',
    kort: 'Begin self of gebruik Steel & Verbeter.',
    beskrywing: 'Dink ’n nuwe woord uit wat die scenario vasvang, of kies iemand anders se woord en gee dit jou eie draai met Steel & Verbeter. Jy kan enige taal gebruik, tale kombineer of iets heeltemal nuuts maak.',
    kleur: 'pienk',
  },
  {
    id: 'lentedag-lied',
    nommer: '03',
    titel: 'Wen die Lentedag-lied',
    kort: 'Die gewildste woord word deel van ’n lied.',
    beskrywing: 'Die woord met die meeste steun uit die voorveldtog word saam met sy frase aan ’n Lentedag-kunstenaar gegee. Die kunstenaar gebruik dit as inspirasie vir ’n lied wat by die fees opgevoer word.',
    kleur: 'groen',
  },
  {
    id: 'fees-en-daarna',
    nommer: '04',
    titel: 'Dit gaan aan by die fees',
    kort: 'Meer frases, uitdagings en woorde wag op Lentedag.',
    beskrywing: 'Wanneer die fees begin, bly hierdie woorde in die kompetisie en maak meer frases en uitdagings oop. Dan stem almal vir die Lente-woord van die jaar. Ná die fees sluit inskrywings en bly die Woordeboek oop om te lees tot volgende jaar.',
    kleur: 'geel',
  },
]

const POST_MEGANIKA: MeganikaItem[] = [
  {
    id: 'woordeboek',
    nommer: '01',
    titel: 'Die Woordeboek',
    kort: 'Lees die woorde wat tydens Lentedag geskep is.',
    beskrywing: 'Hier vind jy elke frase en nuwe woord wat tydens Lentedag ontstaan het. Die stemme is klaar getel, maar die Woordeboek bly oop sodat almal weer deur die jaar se gunstelinge kan blaai.',
    to: '/woordeboek',
    aksie: 'Woordeboek',
    kleur: 'oranje',
  },
  {
    id: 'almal',
    nommer: '02',
    titel: 'Almal kan deelneem',
    kort: 'Jy hoef nie Afrikaans te praat om deel te neem nie.',
    beskrywing: 'Afrikaans was die fokustaal vir 2026, maar dit was nooit ’n taaltoets nie. Deelnemers kon in hul eie taal antwoord, tale kombineer of ’n heel nuwe woord uitdink.',
    kleur: 'pienk',
  },
  {
    id: 'taalvryheid',
    nommer: '03',
    titel: 'Speel met taal',
    kort: 'Daar is nie net een regte antwoord nie.',
    beskrywing: 'Die woord kan slim, snaaks, vreemd of ’n bietjie stout wees. Dit hoef nie reeds te bestaan nie, die doel is juis om ’n nuwe woord te skep vir iets wat almal herken.',
    kleur: 'groen',
  },
  {
    id: 'volgendejaar',
    nommer: '04',
    titel: 'Elke jaar ’n nuwe taal',
    kort: 'Volgende jaar staan ’n ander taal in die kollig.',
    beskrywing: 'Elke Lentedag bring nuwe scenario’s en ’n nuwe fokustaal, maar almal kan steeds in enige taal deelneem. Die woorde van vorige jare bly in die Woordeboek as deel van Lentedag se geskiedenis.',
    kleur: 'geel',
  },
]

export default function HoeDitWerk() {
  const { phase } = useCampaign()
  const isPre = phase === 'pre'
  const isPost = phase === 'post'
  const [oop, setOop] = useState(isPre ? 'eerste-frases' : 'woordeboek')
  const [artistsVisible, setArtistsVisible] = useState(false)
  const artistsRef = useRef<HTMLDivElement>(null)
  const meganika = isPre ? PRE_MEGANIKA : isPost ? POST_MEGANIKA : MEGANIKA

  useEffect(() => {
    if (!isPre || !artistsRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setArtistsVisible(true)
        observer.disconnect()
      },
      { threshold: .14, rootMargin: '0px 0px -4% 0px' },
    )

    observer.observe(artistsRef.current)
    return () => observer.disconnect()
  }, [isPre])

  return (
    <Section
      bg="paper"
      rondBo
      wydte="wyd"
      className={`${styles.section} ${isPre ? styles.preSection : ''}`}
    >
      <div className={styles.layout}>
        <Reveal>
          <div className={styles.story}>
            <img
              className={`${styles.mouth} ${styles.mouthOne}`}
              src={mouthElement}
              alt=""
              aria-hidden="true"
            />
            <img
              className={`${styles.mouth} ${styles.mouthTwo}`}
              src={mouthElement}
              alt=""
              aria-hidden="true"
            />
            <img
              className={`${styles.mouth} ${styles.mouthThree}`}
              src={mouthElement}
              alt=""
              aria-hidden="true"
            />
            <h2>
              <span>WAT IS</span><br />
              <span>LENTE</span><br />
              BOOK?
            </h2>
            {isPre ? (
              <>
                <p className={styles.lead}>
                  Die eerste woorde begin reeds voor Lentedag.
                </p>
                <p>
                  Kies een van die vier fees-scenario’s en skep ’n woord wat die oomblik perfek beskryf. Jy kan ook iemand anders se woord met Steel & Verbeter vat en jou eie weergawe daarvan maak.
                </p>
                <p>
                  Die gewildste woord uit die voorveldtog word saam met sy frase die inspirasie vir ’n lied wat ’n Lentedag-kunstenaar by die fees sal opvoer.
                </p>
                <p>
                  Wanneer Lentedag begin, wag daar meer frases en uitdagings. Al die vroeë woorde bly behoue en ding saam om die Lente-woord van die jaar mee. Ná die fees bly die finale Woordeboek oop om te lees tot volgende jaar.
                </p>
              </>
            ) : isPost ? (
              <>
                <p className={styles.lead}>
                  Die fees is verby, maar die woorde bly.
                </p>
                <p>
                  Lente Book gee mense die kans om nuwe woorde te skep vir daardie oomblikke waarvoor gewone taal net nie genoeg is nie. Jy kan jou eie taal gebruik, tale kombineer of iets heeltemal nuuts uitdink.
                </p>
                <p>
                  Afrikaans was die fokustaal vir 2026, maar almal kon deelneem. Volgende jaar staan ’n ander taal in die kollig en begin ons weer met nuwe scenario’s en nuwe woorde.
                </p>
                <p>
                  Hierdie blad hou 2026 se frases, woorde en finale stemme bymekaar, ’n klein tydkapsule van alles wat julle geskep het.
                </p>
              </>
            ) : (
              <>
                <p className={styles.lead}>
                  Elke lente soek ons die woorde wat nog nie bestaan nie.
                </p>
                <p>
                  Jy kry ’n weird fees-scenario en maak die perfekte nuwe woord daarvoor. Slim, simpel of totaal belaglik, alles werk.
                </p>
                <p>
                  Afrikaans is 2026 se vibe, maar jy hoef dit nie te praat nie. Antwoord in jou eie taal of mix ’n paar saam. Almal kan join.
                </p>
              </>
            )}
            <div className={styles.yearNote}>
              <strong>
                <img src={speakerPhoneElement} alt="" aria-hidden="true" />
                <span>2026 · AFRIKAANS</span>
              </strong>
              <span>
                {isPre
                  ? 'Skep nou ’n woord. Nog frases en uitdagings wag by die fees.'
                  : isPost
                  ? 'Lees die finale woorde. Volgende jaar kry ’n nuwe taal sy beurt.'
                  : 'Die woord met die meeste stemme vat die Lente-woord van die jaar.'}
              </span>
            </div>
          </div>
        </Reveal>

        <div className={`${styles.accordions} ${isPost ? styles.archiveAccordions : ''}`}>
          {meganika.map((item, index) => {
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
                      {item.to && item.aksie && (
                        <Link className={styles.action} to={item.to} viewTransition>
                          {item.aksie}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

      </div>

      {isPre && (
        <div
          ref={artistsRef}
          className={styles.artistStage}
          aria-hidden="true"
        >
          <div
            className={`${styles.artistBackdrop} ${artistsVisible ? styles.artistBackdropVisible : ''}`}
            style={{ backgroundImage: `url(${singersElement})` }}
          />
        </div>
      )}
    </Section>
  )
}
