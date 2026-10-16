import { Pressable, View } from 'react-native'
import type { AwardEntry } from '@fulbito/utils'

import { PlayerAvatar } from '@/components/players/player-avatar'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './award-runners-up.styles'

type Props = {
  entries: AwardEntry[]
  unitLabel: string
  onPressPlayer: (playerId: string) => void
}

export function AwardRunnersUp({ entries, unitLabel, onPressPlayer }: Props) {
  const { colors } = useAppTheme()
  if (entries.length === 0) return null

  return (
    <View style={styles.list}>
      {entries.map((entry, index) => (
        <Pressable
          key={entry.row.id}
          onPress={() => onPressPlayer(entry.row.id)}
          accessibilityRole="button"
          accessibilityLabel={`${index + 2}º puesto, ${entry.row.name}, ${entry.value} ${unitLabel}`}
          accessibilityHint="Abre el perfil del jugador"
          style={({ pressed }) => [styles.row, { backgroundColor: colors.chipBg }, pressed && { opacity: 0.8 }]}>
          <ThemedText style={[styles.position, { color: colors.muted }]}>{index + 2}º</ThemedText>
          <PlayerAvatar name={entry.row.name} photoUrl={entry.row.photoUrl} size={28} />
          <ThemedText numberOfLines={1} style={[styles.name, { color: colors.text }]}>
            {entry.row.name}
          </ThemedText>
          <ThemedText style={[styles.value, { color: colors.text }]}>
            {entry.value} <ThemedText style={[styles.unit, { color: colors.muted }]}>{unitLabel}</ThemedText>
          </ThemedText>
        </Pressable>
      ))}
    </View>
  )
}
