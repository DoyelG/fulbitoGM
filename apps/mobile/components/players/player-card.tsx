import type { Player } from '@fulbito/types'
import { Pressable, StyleSheet, View } from 'react-native'

import { PlayerAvatar } from '@/components/players/player-avatar'
import { PlayerCardActions } from '@/components/players/player-card-actions'
import { PlayerStats } from '@/components/players/player-stats'
import { SkillBadge } from '@/components/players/skill-badge'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type StreakKind = 'win' | 'loss' | null

type Props = {
  player: Player
  streak: { kind: StreakKind; count: number }
  isAdmin: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function PlayerCard({ player, streak, isAdmin, onView, onEdit, onDelete }: Props) {
  const { colors, isDark, shadows, radii } = useAppTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.lg,
        },
        shadows.card(isDark),
      ]}>
      <View style={styles.top}>
        <PlayerAvatar name={player.name} photoUrl={player.photoUrl} />
        <View style={styles.main}>
          <Pressable onPress={onView}>
            <ThemedText type="defaultSemiBold" style={[styles.name, { color: colors.brand }]}>
              {player.name}
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.position, { color: colors.muted }]} numberOfLines={1}>
            {player.position}
          </ThemedText>
          <View style={styles.metaRow}>
            <SkillBadge skill={player.skill ?? 'unknown'} />
          </View>
          <PlayerStats streak={streak} />
        </View>
      </View>
      <PlayerCardActions
        isAdmin={isAdmin}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  main: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 18,
    marginBottom: 2,
  },
  position: {
    fontSize: 14,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
})
