'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  RectangleStackIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import { useDismissable } from '@/hooks/use-dismissable'
import { TournamentPhoto } from './ActiveTournamentAvatar'
import { menuItemClassName } from './menu-item-class'
import UpcomingMatchesMenuItems from './UpcomingMatchesMenuItems'

type MenuItem = {
  name: string
  href: string
  Icon: typeof ChartBarIcon
  exact?: boolean
}

const sectionItems: MenuItem[] = [
  { name: 'Estadísticas', href: '/statistics', Icon: ChartBarIcon },
  { name: 'Jugadores', href: '/players', Icon: UserGroupIcon },
  { name: 'Historial', href: '/history', Icon: ClockIcon, exact: true },
  { name: 'Premios', href: '/awards', Icon: TrophyIcon },
]

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function TournamentMenu() {
  const activeTournament = useTournamentStore(selectActiveTournament)
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = useCallback(() => setIsOpen(false), [])
  const containerRef = useDismissable<HTMLDivElement>(isOpen, closeMenu)

  if (!activeTournament) return null
  const { name, photoUrl } = activeTournament.tournament

  const renderItem = ({ name: label, href, Icon, exact }: MenuItem) => {
    const current = exact ? pathname === href : isCurrent(pathname, href)
    return (
      <Link
        key={href}
        href={href}
        role="menuitem"
        aria-current={current ? 'page' : undefined}
        onClick={closeMenu}
        className={menuItemClassName}
      >
        <Icon className="h-5 w-5 text-primary" aria-hidden />
        {label}
      </Link>
    )
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        aria-label={`Torneo activo: ${name}. Abrir menú del torneo`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 max-w-full items-center gap-1.5 rounded-full bg-white/10 pl-1 pr-4 text-white ring-1 ring-white/30 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <TournamentPhoto photoUrl={photoUrl} className="h-8 w-8" />
        <span aria-hidden className="truncate font-semibold">
          {name}
        </span>
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label={`Menú del torneo ${name}`}
          className="animate-pop-in absolute right-0 top-full z-30 mt-3 flex w-64 flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-xl"
        >
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-primary-gradient p-3 text-white">
            <TournamentPhoto photoUrl={photoUrl} className="h-12 w-12 bg-white/15 ring-2 ring-white/30" />
            <div className="min-w-0">
              <p className="text-xs text-white/80">Torneo activo</p>
              <p className="truncate text-sm font-bold">{name}</p>
            </div>
          </div>
          {renderItem({ name: 'Ver torneos', href: '/tournaments', Icon: RectangleStackIcon })}
          <div className="my-1 h-px bg-gray-200" />
          {sectionItems.map(renderItem)}
          <div className="my-1 h-px bg-gray-200" />
          <UpcomingMatchesMenuItems isOpen={isOpen} onNavigate={closeMenu} />
          <Link
            href="/match"
            role="menuitem"
            aria-current={isCurrent(pathname, '/match') ? 'page' : undefined}
            onClick={closeMenu}
            className={`${menuItemClassName} text-orange-800 hover:bg-orange-50`}
          >
            <PlusIcon className="h-5 w-5 text-secondary" aria-hidden />
            Nuevo partido
          </Link>
        </div>
      )}
    </div>
  )
}
