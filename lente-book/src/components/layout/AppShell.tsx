import { Outlet } from 'react-router-dom'
import SkyBackground from '../decor/SkyBackground'
import TopBar from './TopBar'
import Footer from './Footer'

export default function AppShell() {
  return (
    <>
      <SkyBackground />

      <div className="relative flex min-h-screen flex-col">
        <TopBar />

        <main className="w-full flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </>
  )
}