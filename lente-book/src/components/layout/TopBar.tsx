import { useState } from 'react'
import { Link } from 'react-router-dom'
import BurgerMenu from './BurgerMenu'

const NAV = [
  { to: '/woordeboek', label: 'Woordeboek' },
  { to: '/', label: 'Woordemuur' },
  { to: '/foto', label: 'Voeg Foto By' },
  { to: '/woordjag', label: 'Woordjag' },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/">
          <img src="/elements/lentedag-logo.webp" alt="Lentedag" className="h-9 w-auto md:h-11"
               onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to}
              className="rounded-pill bg-paper px-4 py-2 font-display text-sm text-ink shadow-lift transition hover:-translate-y-0.5">
              {n.label}
            </Link>
          ))}
        </nav>

        <button onClick={() => setOpen(true)} aria-label="Maak kieslys oop"
          className="rounded-pill bg-paper px-3 py-2 shadow-lift active:translate-y-[2px] md:hidden">
          <span className="mb-1 block h-0.5 w-5 bg-ink" />
          <span className="mb-1 block h-0.5 w-5 bg-ink" />
          <span className="block h-0.5 w-5 bg-ink" />
        </button>
      </header>
      <BurgerMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}