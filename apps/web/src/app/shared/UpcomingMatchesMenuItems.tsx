'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { formatShortMatchDate, parseMatchDate } from '@fulbito/utils'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useUpcomingMatchesAcrossTournaments } from '@/hooks/use-next-match'
import { menuItemClassName } from './menu-item-class'

type Props = {
  isOpen: boolean
  onNavigate: () => void
}

export default function UpcomingMatchesMenuItems({ isOpen, onNavigate }: Props) {
  const pathname = usePathname()
  const activeTournamentId = useTournamentStore((s) => s.activeTournamentId)
  const setActiveTournament = useTournamentStore((s) => s.setActiveTournament)
  const upcoming = useUpcomingMatchesAcrossTournaments(isOpen)
  const spansTournaments = new Set(upcoming.map(({ tournament }) => tournament.id)).size > 1

  return upcoming.map(({ match, tournament }) => {
    const href = `/history/${match.id}`
    const subtitle = spansTournaments ? tournament.name : match.name

    const handleClick = () => {
      if (tournament.id !== activeTournamentId) setActiveTournament(tournament.id)
      onNavigate()
    }

    return (
      <Link
        key={match.id}
        href={href}
        role="menuitem"
        aria-current={pathname === href ? 'page' : undefined}
        onClick={handleClick}
        className={`${menuItemClassName} py-2`}
      >
        <CalendarDaysIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0">
          <span className="block">
            Próximo partido <span className="text-gray-600">{formatShortMatchDate(parseMatchDate(match).date)}</span>
          </span>
          {subtitle && <span className="block truncate text-xs font-normal text-gray-600">{subtitle}</span>}
        </span>
      </Link>
    )
  })
}
