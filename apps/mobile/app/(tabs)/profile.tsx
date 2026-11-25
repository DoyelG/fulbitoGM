import { isPersonalTournament } from '@fulbito/utils'
import { getPlayer } from '@fulbito/firebase'
import type { MyTournament, Player } from '@fulbito/types'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerClipsSection } from '@/components/players/detail/player-clips-section'
import { MyTournamentsSection } from '@/components/profile/my-tournaments-section'
import { PlayerRequestSection } from '@/components/profile/player-request-section'
import { PlayerSection } from '@/components/profile/player-section'
import { ProfileHeader } from '@/components/profile/profile-header'
import { styles } from '@/components/profile/profile-screen.styles'
import { ProfileSection } from '@/components/profile/profile-section'
import { ThemedView } from '@/components/themed-view'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'
import { useUnreadComments } from '@/contexts/UnreadCommentsContext'
import { useLinkedPlayerNames } from '@/hooks/use-linked-player-names'
import { useMatchesData } from '@/hooks/use-matches-data'
import { useMyMatchEntries } from '@/hooks/use-my-match-entries'
import { useMyVideoClips } from '@/hooks/use-my-video-clips'
import { useAppTheme } from '@/hooks/use-theme'

export default function ProfileScreen() {
  const { user, isAdmin } = useFirebaseAuth()
  const { activeTournament, myTournaments, setActiveTournament } = useTournaments()
  const { unreadByTournament } = useUnreadComments()
  const playerNameById = useLinkedPlayerNames(myTournaments)
  const { colors } = useAppTheme()
  const { matches } = useMatchesData()
  const [player, setPlayer] = useState<Player | null>(null)

  const myPlayerId = activeTournament?.membership.playerId ?? null
  const isPersonal = isPersonalTournament(activeTournament?.tournament)
  const matchEntries = useMyMatchEntries(isPersonal)
  const otherClips = useMyVideoClips(isPersonal)
  const externalMatches = useMemo(() => matchEntries.entries.map(({ match }) => match), [matchEntries.entries])
  const personalEntries = isPersonal && !matchEntries.loading && !matchEntries.error ? matchEntries.entries : undefined

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
    myTournaments.length === 1 ? '1 torneo' : `${myTournaments.length} torneos`,
    ...(isAdmin ? ['Superadmin'] : []),
  ]

  const openTournament = (item: MyTournament) => {
    setActiveTournament(item.tournament.id)
    router.navigate('/home')
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ThemedView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <ProfileHeader email={user.email} badges={badges} photoUrl={player?.photoUrl} />
          <MyTournamentsSection
            myTournaments={myTournaments}
            activeTournamentId={activeTournament?.tournament.id ?? null}
            playerNameById={playerNameById}
            unreadByTournament={unreadByTournament}
            index={0}
            onOpen={openTournament}
          />
          {activeTournament && (
            <Text
              style={[
                styles.groupTitle,
                isPersonal && styles.personalTitle,
                { color: isPersonal ? colors.text : colors.muted },
              ]}
              accessibilityRole="header"
            >
              {isPersonal ? 'TU HISTORIA PERSONAL' : `EN ${activeTournament.tournament.name.toUpperCase()}`}
            </Text>
          )}
          {player && (
            <PlayerSection
              key={player.id}
              player={player}
              matches={matches}
              entries={personalEntries}
              isPersonal={isPersonal}
              index={1}
              onPhotoChanged={() => void loadPlayer()}
            />
          )}
          {player && (
            <ProfileSection icon="film" title="Mis clips" index={2}>
              <PlayerClipsSection
                playerId={player.id}
                matches={matches}
                canUpload
                extraClips={otherClips}
                extraMatches={externalMatches}
              />
            </ProfileSection>
          )}
          {activeTournament && !isPersonal && !myPlayerId && (
            <PlayerRequestSection
              key={activeTournament.tournament.id}
              user={user}
              tournamentId={activeTournament.tournament.id}
              tournamentName={activeTournament.tournament.name}
              index={1}
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
