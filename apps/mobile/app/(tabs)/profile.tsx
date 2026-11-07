import { getPlayer } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { TOURNAMENT_ROLE_LABELS } from '@fulbito/utils'
import { useCallback, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerClipsSection } from '@/components/players/detail/player-clips-section'
import { PlayerRequestSection } from '@/components/profile/player-request-section'
import { PlayerSection } from '@/components/profile/player-section'
import { ProfileHeader } from '@/components/profile/profile-header'
import { styles } from '@/components/profile/profile-screen.styles'
import { ProfileSection } from '@/components/profile/profile-section'
import { ThemedView } from '@/components/themed-view'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'
import { useMatchesData } from '@/hooks/use-matches-data'

export default function ProfileScreen() {
  const { user, isAdmin } = useFirebaseAuth()
  const { activeTournament } = useTournaments()
  const { matches } = useMatchesData()
  const [player, setPlayer] = useState<Player | null>(null)

  const myPlayerId = activeTournament?.membership.playerId ?? null

  const loadPlayer = useCallback(async () => {
    setPlayer(myPlayerId ? await getPlayer(myPlayerId) : null)
  }, [myPlayerId])

  useEffect(() => {
    void loadPlayer().catch(() => setPlayer(null))
  }, [loadPlayer])

  if (!user) {
    return (
      <ThemedView style={styles.safe}>
        <EmptyState
          icon="user"
          title="Iniciá sesión"
          description="Necesitás una cuenta para ver tu perfil."
          action={{ label: 'Iniciar sesión', href: '/login' }}
        />
      </ThemedView>
    )
  }

  const badges = [
    ...(activeTournament
      ? [`${TOURNAMENT_ROLE_LABELS[activeTournament.membership.role]} en ${activeTournament.tournament.name}`]
      : []),
    ...(isAdmin ? ['Superadmin'] : []),
  ]

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ThemedView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <ProfileHeader email={user.email} badges={badges} photoUrl={player?.photoUrl} />
          {player && <PlayerSection key={player.id} player={player} index={0} onSaved={() => void loadPlayer()} />}
          {player && (
            <ProfileSection icon="film" title="Mis clips" index={1}>
              <PlayerClipsSection playerId={player.id} matches={matches} canUpload />
            </ProfileSection>
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
          {!activeTournament && (
            <EmptyState
              icon="award"
              title="Sin torneo activo"
              description="Elegí o creá un torneo para ver tu jugador y tus clips."
              action={{ label: 'Ver mis torneos', href: '/tournaments' }}
            />
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
