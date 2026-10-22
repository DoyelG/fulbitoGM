import type { Player } from '@fulbito/types'
import { getGoalkeeping } from '@fulbito/utils'
import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, View } from 'react-native'

import { GoalMiniBar } from '@/components/players/goal-mini-bar'
import { PlayerAvatar } from '@/components/players/player-avatar'
import { SkillBig } from '@/components/players/skill-big'
import { StreakBadge } from '@/components/players/streak-badge'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type StreakKind = 'win' | 'loss' | null

type Props = {
  player: Player
  streak: { kind: StreakKind; count: number }
  onPress: () => void
  onLongPress?: () => void
  isGoalkeepingMode?: boolean
}

const AVATAR_SIZE = 48

export function PlayerCard({ player, streak, onPress, onLongPress, isGoalkeepingMode = false }: Props) {
  const { colors, isDark, shadows, radii } = useAppTheme()
  const winGoalProgress = streak.kind === 'win' ? streak.count : 0

  const displayedSkill = isGoalkeepingMode ? getGoalkeeping(player) : (player.skill ?? null)

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.lg,
        },
        shadows.card(isDark),
        pressed && { opacity: 0.92 },
      ]}>
      <LinearGradient
        pointerEvents="none"
        colors={[isGoalkeepingMode ? colors.goalkeeper : colors.brand, colors.surface]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        locations={[0, 0.6]}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg - 1 }]}
      />
      <PlayerAvatar name={player.name} photoUrl={player.photoUrl} size={AVATAR_SIZE} />

      <View style={styles.middle}>
        <ThemedText
          type="defaultSemiBold"
          numberOfLines={1}
          style={styles.name}>
          {player.name}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText
            numberOfLines={1}
            style={[styles.position, { color: colors.muted }]}>
            {player.position}
          </ThemedText>
          {streak.kind ? <StreakBadge kind={streak.kind} count={streak.count} /> : null}
        </View>
      </View>

      <View style={styles.right}>
        <SkillBig skill={displayedSkill} isGoalkeepingMode={isGoalkeepingMode} />
        <GoalMiniBar winCount={winGoalProgress} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  position: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
})
