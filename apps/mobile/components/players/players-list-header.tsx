import { StyleSheet, View } from 'react-native'
import { HeaderAddButton } from '@/components/players/header-add-button'
import { PlayersSearchBar } from '@/components/players/players-search-bar'
import { PositionFilterRow, type PositionFilter } from '@/components/players/position-filter-row'
import { SkillFilterRow, type SkillMode } from '@/components/players/skill-filter-row'

type Props = {
  query: string
  onQueryChange: (v: string) => void
  positions: string[]
  position: PositionFilter
  onPositionChange: (v: PositionFilter) => void
  isAdmin: boolean
  onAdd: () => void
  skillMode: SkillMode
  sortDir: 'asc' | 'desc'
  onSkillSelect: (mode: SkillMode) => void
  cuantityOfPlayers: number
}

export function PlayersListHeader({
  query,
  onQueryChange,
  positions,
  position,
  onPositionChange,
  isAdmin,
  onAdd,
  skillMode,
  sortDir,
  onSkillSelect,
  cuantityOfPlayers,
}: Props) {
  return (
    <View style={styles.wrap}>
      {isAdmin && (
        <View style={styles.addRow}>
          <HeaderAddButton onPress={onAdd} />
        </View>
      )}
      <PlayersSearchBar value={query} onChange={onQueryChange} />
      <PositionFilterRow
        positions={positions}
        value={position}
        onChange={onPositionChange}
      />
      <SkillFilterRow mode={skillMode} dir={sortDir} onSelect={onSkillSelect} cuantityOfPlayers={cuantityOfPlayers}/>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginBottom: 12,
  },
  addRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },
})
