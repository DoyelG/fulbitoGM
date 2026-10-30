'use client'

import { FiUser } from 'react-icons/fi'
import EmptyState from '@/components/EmptyState'
import { ROLE_LABELS } from '@/components/tournaments/tournament-roles'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import VideoClipsSection from '@/components/videoClips/VideoClipsSection'
import PlayerRequestSection from './PlayerRequestSection'
import PlayerSection from './PlayerSection'
import ProfileHeader from './ProfileHeader'

export default function ProfileClient() {
  const { user, isAdmin } = useFirebaseAuth()
  const activeTournament = useTournamentStore(selectActiveTournament)
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

  const badges = [
    ...(activeTournament
      ? [`${ROLE_LABELS[activeTournament.membership.role]} en ${activeTournament.tournament.name}`]
      : []),
    ...(isAdmin ? ['Superadmin'] : []),
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <ProfileHeader email={user.email} badges={badges} photoUrl={player?.photoUrl} />
      <div className="space-y-6">
        {player && <PlayerSection key={player.id} player={player} index={0} />}
        {player && (
          <div style={{ animationDelay: '80ms' }} className="animate-fade-up">
            <VideoClipsSection player={player} matches={matches} canUpload />
          </div>
        )}
        {activeTournament && !myPlayerId && (
          <PlayerRequestSection
            key={activeTournament.tournament.id}
            user={user}
            tournamentId={activeTournament.tournament.id}
            tournamentName={activeTournament.tournament.name}
            index={0}
          />
        )}
      </div>
    </div>
  )
}
