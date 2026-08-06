import { useState } from 'react'
import { Link } from 'react-router-dom'

import BurgerMenu from './BurgerMenu'
import { useAuth } from '../../features/auth/AuthContext'

const NAV = [
  {
    to: '/woordeboek',
    label: 'Woordeboek',
  },
  {
    to: '/foto',
    label: 'Voeg Foto By',
  },
  {
    to: '/woordjag',
    label: 'Woordjag',
  },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)

  const {
    user,
    profile,
  } = useAuth()

  const profileImage =
    profile?.useGooglePhoto &&
    user?.photoURL
      ? user.photoURL
      : null

  return (
    <>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link to="/">
          <img
            src="/elements/lentedag-logo.webp"
            alt="Lentedag"
            className="h-9 w-auto md:h-11"
            onError={(event) => {
              event.currentTarget.style.display =
                'none'
            }}
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-pill bg-paper px-4 py-2 font-display text-sm text-ink shadow-lift transition hover:-translate-y-0.5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && profile && (
            <Link
              to="/welkom"
              className="flex items-center gap-2 rounded-pill border-2 border-ink bg-paper py-1 pl-1 pr-3 text-ink shadow-lift"
            >
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-goud text-xl">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.character
                )}
              </span>

              <span className="hidden max-w-32 truncate text-sm font-extrabold sm:block">
                {profile.username}
              </span>
            </Link>
          )}

          <button
            onClick={() => setOpen(true)}
            aria-label="Maak kieslys oop"
            className="rounded-pill bg-paper px-3 py-2 shadow-lift active:translate-y-0.5 md:hidden"
          >
            <span className="mb-1 block h-0.5 w-5 bg-ink" />
            <span className="mb-1 block h-0.5 w-5 bg-ink" />
            <span className="block h-0.5 w-5 bg-ink" />
          </button>
        </div>
      </header>

      <BurgerMenu
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}