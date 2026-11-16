import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import type { MyTournament } from '@fulbito/types'
import { unreadCommentsLabel } from '@fulbito/utils'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'

import { RoleBadge } from '@/components/tournaments/role-badge'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './my-tournaments-section.styles'
import { ProfileSection } from './profile-section'

type Props = {
  myTournaments: MyTournament[]
  activeTournamentId: string | null
  playerNameById: Map<string, string>
  unreadByTournament: Record<string, number>
  index: number
  onOpen: (item: MyTournament) => void
}

export function MyTournamentsSection({
  myTournaments,
  activeTournamentId,
  playerNameById,
  unreadByTournament,
  index,
  onOpen,
}: Props) {
  const { colors } = useAppTheme()

  return (
    <ProfileSection icon="award" title="Mis torneos" index={index}>
      {myTournaments.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>Todavía no sos parte de ningún torneo.</Text>
      ) : (
        <View style={styles.list}>
          {myTournaments.map((item) => {
            const { tournament, membership } = item
            const isActive = tournament.id === activeTournamentId
            const playerName = membership.playerId ? playerNameById.get(membership.playerId) : null
            const unread = unreadByTournament[tournament.id] ?? 0
            const playerLabel = playerName ? `Jugador: ${playerName}` : 'Sin jugador vinculado'
            return (
              <Pressable
                key={tournament.id}
                onPress={() => onOpen(item)}
                accessibilityRole="button"
                accessibilityLabel={`${tournament.name}${isActive ? ', activo' : ''}. ${playerLabel}${
                  unread > 0 ? `. ${unreadCommentsLabel(unread)}` : ''
                }`}
                accessibilityHint={isActive ? 'Abre el inicio del torneo' : 'Activa el torneo y abre su inicio'}
                style={({ pressed }) => [styles.row, { borderColor: colors.border }, pressed && styles.pressed]}
              >
                <View style={[styles.photo, { backgroundColor: colors.primarySoft }]}>
                  {tournament.photoUrl ? (
                    <Image
                      source={{ uri: tournament.photoUrl }}
                      contentFit="cover"
                      style={styles.photoImage}
                      accessible={false}
                    />
                  ) : (
                    <MaterialCommunityIcons name="trophy-outline" size={22} color={colors.primaryText} />
                  )}
                </View>
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                      {tournament.name}
                    </Text>
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.activeText, { color: colors.onPrimary }]}>ACTIVO</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.titleRow}>
                    <RoleBadge role={membership.role} />
                    {unread > 0 && (
                      <Text style={[styles.unread, { color: colors.secondaryText }]}>
                        {unreadCommentsLabel(unread)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.player, { color: colors.muted }]} numberOfLines={1}>
                    {playerLabel}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.muted} accessible={false} />
              </Pressable>
            )
          })}
        </View>
      )}
    </ProfileSection>
  )
}
