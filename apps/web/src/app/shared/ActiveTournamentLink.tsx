'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'

type Props = {
  onNavigate?: () => void
}

export default function ActiveTournamentLink({ onNavigate }: Props) {
  const { user, loading } = useFirebaseAuth()
  const myTournamentsInit = useTournamentStore((state) => state.myTournamentsInit)
  const myTournamentsUid = useTournamentStore((state) => state.myTournamentsUid)
  const loadMyTournaments = useTournamentStore((state) => state.loadMyTournaments)
  const clearTournaments = useTournamentStore((state) => state.clearTournaments)
  const activeTournament = useTournamentStore(selectActiveTournament)

  useEffect(() => {
    if (loading) return
    if (!user) {
      if (myTournamentsUid) clearTournaments()
      return
    }
    if (myTournamentsInit === 'idle' || myTournamentsUid !== user.uid) loadMyTournaments(user.uid)
  }, [loading, user, myTournamentsInit, myTournamentsUid, loadMyTournaments, clearTournaments])

  const name = activeTournament?.tournament.name

  return (
    <Link
      href="/tournaments"
      onClick={onNavigate}
      title={name ? `Torneo activo: ${name}` : undefined}
      aria-label={name ? `Torneo activo: ${name}. Ver mis torneos` : undefined}
      className="group relative overflow-hidden rounded-xl bg-primary/10 px-4 py-3 text-primary ring-1 ring-primary/30 lg:rounded-full lg:bg-white/15 lg:px-2 lg:py-2 lg:text-white lg:ring-white/30 xl:px-3"
    >
      <span
        className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
      <span className="relative flex items-center gap-1.5">
        <TrophyIcon className="h-5 w-5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 lg:flex-none">
          <span className="block text-xs font-medium text-gray-700 lg:hidden">
            {name ? 'Torneo activo' : 'Torneos'}
          </span>
          <span className="block truncate font-semibold lg:max-w-[6rem] lg:font-normal xl:max-w-[10rem]">
            {name ?? 'Mis torneos'}
          </span>
        </span>
        <ChevronRightIcon className="h-5 w-5 shrink-0 lg:hidden" aria-hidden />
      </span>
    </Link>
  )
}
