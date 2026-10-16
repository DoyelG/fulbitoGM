import { StyleSheet, View } from 'react-native'
import { GOALKEEPER_COLOR } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import { ThemedText } from '../themed-text'
import { SortChip } from './sort-chip'

export type SkillMode = 'player' | 'goalkeeper'

type Props = {
  mode: SkillMode
  dir: 'asc' | 'desc'
  onSelect: (mode: SkillMode) => void
  cuantityOfPlayers: number
}

export function SkillFilterRow({ mode, dir, onSelect, cuantityOfPlayers }: Props) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.count, { color: colors.muted }]}>{cuantityOfPlayers} jugadores</ThemedText>
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
          active={mode === 'player'} dir={dir} onPress={() => onSelect('player')} />
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
