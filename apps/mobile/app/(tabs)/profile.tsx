import { getPlayer } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerClipsSection } from '@/components/players/detail/player-clips-section'
import { PlayerSection } from '@/components/profile/player-section'
import { ProfileHeader } from '@/components/profile/profile-header'
import { styles } from '@/components/profile/profile-screen.styles'
import { ProfileSection } from '@/components/profile/profile-section'
import { RoleRequestSection } from '@/components/profile/role-request-section'
import { ThemedView } from '@/components/themed-view'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMatchesData } from '@/hooks/use-matches-data'

export default function ProfileScreen() {
  const { user, isAdmin } = useFirebaseAuth()
  const { matches } = useMatchesData()
  const [player, setPlayer] = useState<Player | null>(null)

  const linkedPlayerId = user?.linkedPlayerId

  const loadPlayer = useCallback(async () => {
    setPlayer(linkedPlayerId ? await getPlayer(linkedPlayerId) : null)
  }, [linkedPlayerId])

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

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ThemedView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <ProfileHeader email={user.email} roles={user.role} photoUrl={player?.photoUrl} />
          {player && <PlayerSection key={player.id} player={player} index={0} onSaved={() => void loadPlayer()} />}
          {player && (
            <ProfileSection icon="film" title="Mis clips" index={1}>
              <PlayerClipsSection playerId={player.id} matches={matches} canUpload />
            </ProfileSection>
          )}
          <RoleRequestSection user={user} isAdmin={isAdmin} index={2} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
