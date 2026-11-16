'use client'

import { FiUser } from 'react-icons/fi'
import EmptyState from '@/components/EmptyState'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import { useUnreadCommentsStore } from '@/store/useUnreadCommentsStore'
import { useLinkedPlayerNames } from '@/hooks/use-linked-player-names'
import VideoClipsSection from '@/components/videoClips/VideoClipsSection'
import PlayerRequestSection from './PlayerRequestSection'
import MyTournamentsSection from './MyTournamentsSection'
import PlayerSection from './PlayerSection'
import ProfileHeader from './ProfileHeader'
import ProfileCommentsPanel from './ProfileCommentsPanel'

export default function ProfileClient() {
  const { user, isAdmin } = useFirebaseAuth()
  const activeTournament = useTournamentStore(selectActiveTournament)
  const myTournaments = useTournamentStore((state) => state.myTournaments)
  const unreadByTournament = useUnreadCommentsStore((state) => state.unreadByTournament)
  const playerNameById = useLinkedPlayerNames(myTournaments)
  const myPlayerId = activeTournament?.membership.playerId
  const player = usePlayerStore((state) => state.players.find((item) => item.id === myPlayerId))
  const matches = useMatchStore((state) => state.matches)

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={FiUser}
          title="Iniciá sesión"
          description="Necesitás una cuenta para ver tu perfil."
          action={{ label: 'Iniciar sesión', href: '/login' }}
        />
      </div>
    )
  }

  const tournamentCount = myTournaments.length
  const badges = [tournamentCount === 1 ? '1 torneo' : `${tournamentCount} torneos`, ...(isAdmin ? ['Superadmin'] : [])]

  return (
    <div
      className={`mx-auto px-4 py-8 sm:px-6 lg:px-8 ${activeTournament ? 'max-w-6xl lg:grid lg:min-h-[calc(100vh-var(--site-header-height,0px))] lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:grid-rows-[auto_1fr] lg:gap-6' : 'max-w-3xl'}`}
    >
      <div className="min-w-0 lg:col-start-1">
        <ProfileHeader email={user.email} badges={badges} photoUrl={player?.photoUrl} />
        <MyTournamentsSection
          myTournaments={myTournaments}
          activeTournamentId={activeTournament?.tournament.id ?? null}
          playerNameById={playerNameById}
          unreadByTournament={unreadByTournament}
          index={0}
        />
      </div>
      {activeTournament && (
        <aside
          aria-label={`Comentarios de ${activeTournament.tournament.name}`}
          className="mt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:flex lg:flex-col"
        >
          <ProfileCommentsPanel key={activeTournament.tournament.id} item={activeTournament} user={user} />
        </aside>
      )}
      <div className="mt-6 min-w-0 space-y-6 lg:col-start-1 lg:mt-0">
        {activeTournament && (
          <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
            En {activeTournament.tournament.name}
          </h2>
        )}
        {player && <PlayerSection key={player.id} player={player} matches={matches} index={1} />}
        {player && (
          <div style={{ animationDelay: '80ms' }} className="animate-fade-up">
            <VideoClipsSection playerId={player.id} matches={matches} canUpload />
          </div>
        )}
        {activeTournament && !myPlayerId && (
          <PlayerRequestSection
            key={activeTournament.tournament.id}
            user={user}
            tournamentId={activeTournament.tournament.id}
            tournamentName={activeTournament.tournament.name}
            index={1}
          />
        )}
      </div>
    </div>
  )
}
