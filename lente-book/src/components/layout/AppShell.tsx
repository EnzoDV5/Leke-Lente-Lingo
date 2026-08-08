import {
  Outlet,
  useLocation,
} from 'react-router-dom'
import TopBar from './TopBar'
import Footer from './Footer'
import styles from './AppShell.module.css'

type RouteState = {
  onboardingReveal?: boolean
}

export default function AppShell() {
  const location = useLocation()
  const routeState =
    location.state as RouteState | null

  const revealHome =
    Boolean(routeState?.onboardingReveal)

  return (
    <div
      className={[
        styles.shell,
        revealHome
          ? styles.homeReveal
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.shellContent}>
        <TopBar />

        <main className={styles.page}>
          <Outlet />
        </main>

        <div className={styles.footer}>
          <Footer />
        </div>
      </div>
    </div>
  )
}
