import { Link } from 'react-router-dom'

type Props = { open: boolean; onClose: () => void }

const LINKS = [
  { to: '/woordeboek', label: 'Woordeboek',   color: 'bg-blou text-paper' },
  { to: '/',           label: 'Woordemuur',   color: 'bg-goud text-ink'   },
  { to: '/foto',       label: 'Voeg Foto By', color: 'bg-pienk text-paper'},
  { to: '/woordjag',   label: 'Die Woordjag', color: 'bg-groen text-ink'  },
]

export default function BurgerMenu({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-[440px] flex-col px-5 pt-4">
        <button onClick={onClose} aria-label="Maak toe"
          className="self-end rounded-pill bg-paper px-4 py-2 font-display text-ink">✕</button>
        <nav className="mt-8 flex flex-col gap-4">
          {LINKS.map((l) => (
            <Link key={l.label} to={l.to} onClick={onClose}
              className={`${l.color} rounded-card px-5 py-4 font-display text-lg shadow-lift`}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}