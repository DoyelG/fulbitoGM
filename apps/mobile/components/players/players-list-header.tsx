import { StyleSheet, View } from 'react-native'

import { SortChip } from '@/components/players/sort-chip'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

export type SortKey = 'skill' | 'streak' | 'goal7'
export type SortDir = 'asc' | 'desc'

type Props = {
  total: number
  sortKey: SortKey
  sortDir: SortDir
  onToggle: (key: SortKey) => void
}

export function PlayersListHeader({ total, sortKey, sortDir, onToggle }: Props) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <ThemedText style={[styles.kicker, { color: colors.muted }]}>Plantel</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.count}>
          {total} {total === 1 ? 'jugador' : 'jugadores'}
        </ThemedText>
      </View>
      <ThemedText style={[styles.sortLabel, { color: colors.muted }]}>Ordenar por</ThemedText>
      <View style={styles.row}>
        <SortChip
          label="Habilidad"
          active={sortKey === 'skill'}
          dir={sortDir}
          onPress={() => onToggle('skill')}
        />
        <SortChip
          label="Racha"
          active={sortKey === 'streak'}
          dir={sortDir}
          onPress={() => onToggle('streak')}
        />
        <SortChip
          label="Objetivo (7W)"
          active={sortKey === 'goal7'}
          dir={sortDir}
          onPress={() => onToggle('goal7')}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  top: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
})
