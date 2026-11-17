'use client'

import Link from 'next/link'
import { ChevronRightIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'

type Props = {
  onNavigate?: () => void
}

export default function ActiveTournamentLink({ onNavigate }: Props) {
  const activeTournament = useTournamentStore(selectActiveTournament)

  const name = activeTournament?.tournament.name

  return (
    <Link
      href="/tournaments"
      onClick={onNavigate}
      title={name ? `Torneo activo: ${name}` : undefined}
      aria-label={name ? `Torneo activo: ${name}. Ver mis torneos` : undefined}
      className="group relative overflow-hidden rounded-xl bg-primary/10 px-4 py-3 text-primary ring-1 ring-primary/30 sm:hidden"
    >
      <span
        className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
      <span className="relative flex items-center gap-1.5">
        <TrophyIcon className="h-5 w-5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-gray-700">
            {name ? 'Torneo activo' : 'Torneos'}
          </span>
          <span className="block truncate font-semibold">
            {name ?? 'Mis torneos'}
          </span>
        </span>
        <ChevronRightIcon className="h-5 w-5 shrink-0" aria-hidden />
      </span>
    </Link>
  )
}
