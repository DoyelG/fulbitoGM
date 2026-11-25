'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FiAward } from 'react-icons/fi'
import { TrophyIcon, UserIcon } from '@heroicons/react/24/outline'
import type { MyTournament } from '@fulbito/types'
import { isPersonalTournament, unreadCommentsLabel } from '@fulbito/utils'
import { ROLE_LABELS, ROLE_STYLES } from '@/components/tournaments/tournament-roles'
import { useTournamentStore } from '@/store/useTournamentStore'
import ProfileSection from './ProfileSection'

type Props = {
  myTournaments: MyTournament[]
  activeTournamentId: string | null
  playerNameById: Map<string, string>
  unreadByTournament: Record<string, number>
  index: number
}

export default function MyTournamentsSection({
  myTournaments,
  activeTournamentId,
  playerNameById,
  unreadByTournament,
  index,
}: Props) {
  const setActiveTournament = useTournamentStore((state) => state.setActiveTournament)
  const sortedTournaments = [...myTournaments].sort(
    (a, b) => Number(isPersonalTournament(b.tournament)) - Number(isPersonalTournament(a.tournament)),
  )

  return (
    <ProfileSection icon={FiAward} title="Mis torneos" index={index}>
      {myTournaments.length === 0 ? (
        <p className="text-sm text-gray-700">
          Todavía no sos parte de ningún torneo.{' '}
          <Link href="/tournaments" className="font-medium text-primary hover:underline">
            Creá uno o aceptá una invitación
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sortedTournaments.map(({ tournament, membership }) => {
            const isPersonal = isPersonalTournament(tournament)
            const playerName = membership.playerId ? playerNameById.get(membership.playerId) : null
            const unread = tournament.id === activeTournamentId ? 0 : (unreadByTournament[tournament.id] ?? 0)
            return (
              <li
                key={tournament.id}
                className={`group relative flex items-center gap-3 rounded-lg px-2 py-3 focus-within:ring-2 focus-within:ring-primary hover:bg-gray-50 ${isPersonal ? 'bg-primary/5' : ''}`}
              >
                <span
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg ${isPersonal ? 'bg-primary-gradient' : 'bg-primary/5'}`}
                >
                  {isPersonal ? (
                    <UserIcon className="h-6 w-6 text-white" aria-hidden />
                  ) : tournament.photoUrl ? (
                    <Image src={tournament.photoUrl} alt="" fill unoptimized sizes="48px" className="object-cover" />
                  ) : (
                    <TrophyIcon className="h-6 w-6 text-primary" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <Link
                      href={isPersonal ? '/my-history' : `/tournaments/${tournament.id}`}
                      className="font-semibold text-gray-900 after:absolute after:inset-0 after:rounded-lg focus:outline-none group-hover:text-primary group-hover:underline"
                    >
                      {tournament.name}
                    </Link>
                    {isPersonal ? (
                      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-orange-800">
                        Personal
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_STYLES[membership.role]}`}
                      >
                        {ROLE_LABELS[membership.role]}
                      </span>
                    )}
                    {tournament.id === activeTournamentId && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                        Activo
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-gray-700">
                    {playerName ? `Jugador: ${playerName}` : 'Sin jugador vinculado'}
                  </span>
                  {unread > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTournament(tournament.id)}
                      aria-label={`${unreadCommentsLabel(unread)}. Activar ${tournament.name} para verlos`}
                      className="relative z-10 mt-1 inline-block rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-orange-800 transition-colors hover:bg-secondary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                    >
                      {unreadCommentsLabel(unread)}
                    </button>
                  )}
                </span>
                {tournament.id !== activeTournamentId && (
                  <button
                    type="button"
                    onClick={() => setActiveTournament(tournament.id)}
                    aria-label={`Activar ${tournament.name}`}
                    className="relative z-10 inline-flex min-h-11 shrink-0 items-center rounded-full bg-primary-dark/10 px-4 text-sm font-medium text-primary-dark transition-colors hover:bg-primary-dark/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:min-h-0 sm:py-1.5"
                  >
                    Activar
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </ProfileSection>
  )
}
