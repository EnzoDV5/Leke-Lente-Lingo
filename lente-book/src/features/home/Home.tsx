import Marquee from '../../components/layout/Marquee'
import Fotomuur from './sections/Fotomuur'
import Actions from './sections/Actions'
import Leaderboard from './sections/Leaderboard'
import HoeDitWerk from './sections/HoeDitWerk'

import styles from './Home.module.css'

export default function Home() {
  return (
    <>
      {/* Photo-wall hero */}
      <Fotomuur />

      {/* Yellow scrolling bar */}
      <Marquee />

      {/* What will you do? */}
      <section className={styles.actionsBand}>
        <Actions />
      </section>

      {/* Live voting podium */}
      <Leaderboard />

      {/* How Lente Book works */}
      <HoeDitWerk />
    </>
  )
}