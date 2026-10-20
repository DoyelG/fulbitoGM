import type { SkillMode } from '@fulbito/types'
import { StyleSheet, View } from 'react-native'

import { SortChip } from '@/components/players/sort-chip'
import { ThemedText } from '@/components/themed-text'
import { GOALKEEPER_COLOR } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  mode: SkillMode
  dir: 'asc' | 'desc'
  onSelect: (mode: SkillMode) => void
  playersCount: number
}

export function SkillFilterRow({ mode, dir, onSelect, playersCount }: Props) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.count, { color: colors.muted }]}>{playersCount} jugadores</ThemedText>
      <View style={styles.SortChipRow}>
        <SortChip
          label="🧤"
          accessibilityLabel="Ordenar por nivel de arquero"
          active={mode === 'goalkeeper'}
          dir={dir}
          activeColor={GOALKEEPER_COLOR}
          onPress={() => onSelect('goalkeeper')}
        />
        <SortChip
          label="⚽️"
          accessibilityLabel="Ordenar por nivel de jugador"
          active={mode === 'player'}
          dir={dir}
          onPress={() => onSelect('player')}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  SortChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
})
