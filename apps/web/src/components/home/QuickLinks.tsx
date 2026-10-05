import Link from 'next/link'
import { ChartBarIcon, ClockIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const LINKS = [
  { href: '/players', label: 'Jugadores', Icon: UserGroupIcon },
  { href: '/statistics', label: 'Estadísticas', Icon: ChartBarIcon },
  { href: '/history', label: 'Historial', Icon: ClockIcon },
  { href: '/awards', label: 'Premios', Icon: TrophyIcon },
]

export default function QuickLinks() {
  return (
    <nav aria-label="Accesos rápidos">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {LINKS.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-14 items-center gap-3 bg-scoreboard rounded-xl border border-white/10 p-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-violet-200">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
