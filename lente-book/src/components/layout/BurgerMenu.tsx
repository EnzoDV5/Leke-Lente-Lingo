import { Link } from 'react-router-dom'

import { useAuth } from '../../features/auth/AuthContext'

type Props = {
  open: boolean
  onClose: () => void
}

const LINKS = [
  {
    to: '/',
    label: 'Woordemuur',
    color: 'bg-goud text-ink',
  },
  {
    to: '/woordeboek',
    label: 'Woordeboek',
    color: 'bg-blou text-paper',
  },
  {
    to: '/foto',
    label: 'Voeg Foto By',
    color: 'bg-pienk text-paper',
  },
  {
    to: '/woordjag',
    label: 'Die Woordjag',
    color: 'bg-groen text-ink',
  },
]

export default function BurgerMenu({
  open,
  onClose,
}: Props) {
  const { user, profile } = useAuth()

  if (!open) return null

  const profileImage =
    profile?.useGooglePhoto && user?.photoURL
      ? user.photoURL
      : null

  return (
    <div className="fixed inset-0 z-[100] bg-ink/90 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[440px] flex-col rounded-[28px] border-4 border-oranje bg-paper p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <img
            src="/elements/lentedag-logo.webp"
            alt="Lentedag"
            className="h-14 w-auto"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Maak kieslys toe"
            className="grid h-12 w-12 place-items-center rounded-[13px] border-[3px] border-oranje bg-geel font-pixel text-2xl font-bold text-oranje shadow-lift"
          >
            ×
          </button>
        </div>

        {user && profile && (
          <Link
            to="/welkom"
            onClick={onClose}
            className="mt-6 flex items-center gap-3 rounded-[16px] border-[3px] border-oranje bg-white p-2 text-ink shadow-lift"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[11px] border-2 border-oranje bg-geel text-2xl">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.character
              )}
            </span>

            <span className="min-w-0">
              <small className="block font-pixel text-[10px] uppercase tracking-wider text-oranje">
                My profiel
              </small>

              <strong className="block truncate font-display text-base">
                {profile.username}
              </strong>
            </span>
          </Link>
        )}

        <nav className="mt-6 flex flex-col gap-3">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={onClose}
              className={`${link.color} rounded-[16px] border-[3px] border-oranje px-5 py-4 font-pixel text-lg uppercase shadow-lift transition active:translate-y-1`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}