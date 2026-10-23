import type { StreakLeader } from '@fulbito/utils'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Spacing, Fonts } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import { PlayerAvatar } from '@/components/players/player-avatar'

type Props = {
  leader: StreakLeader
  pos: number
  showBorder: boolean
}

export function HomeRankingRow({ leader, pos, showBorder }: Props) {
  const { colors: C } = useAppTheme()
  const isFirst = pos === 1

  return (
    <View style={[styles.row, showBorder && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
      <Text style={[styles.pos, { color: C.muted }, isFirst && { color: C.secondary, fontFamily: Fonts.extraBold }]}>
        {pos}
      </Text>
      <PlayerAvatar name={leader.playerName} photoUrl={leader.playerPhotoUrl} size={40} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: C.text }]}>{leader.playerName}</Text>
      </View>
      <View style={styles.streakWrap}>
        <Text style={[styles.streakNum, isFirst && styles.streakNumFirst, { color: C.secondary }]}>{leader.count}</Text>
        <MaterialCommunityIcons name="fire" size={isFirst ? 22 : 18} color={C.secondary} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  pos: {
    fontFamily: Fonts.bold,
    width: 20,
    fontSize: 16,
  },
  info: { flex: 1 },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  streakWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakNum: {
    fontFamily: Fonts.extraBold,
    fontSize: 18,
  },
  streakNumFirst: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
  },
})
