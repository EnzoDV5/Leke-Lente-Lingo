import Marquee from '../../components/layout/Marquee'
import Fotomuur from './sections/Fotomuur'
import Actions from './sections/Actions'
import Leaderboard from './sections/Leaderboard'
import HoeDitWerk from './sections/HoeDitWerk'

export default function Home() {
  return (
    <>
      <Fotomuur />
      <Marquee />
      <Actions />
      <Leaderboard />
      <HoeDitWerk />
    </>
  )
}