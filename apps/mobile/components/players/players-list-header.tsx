import type { SkillMode } from '@fulbito/types'
import { StyleSheet, View } from 'react-native'

import { HeaderAddButton } from '@/components/players/header-add-button'
import { PlayersSearchBar } from '@/components/players/players-search-bar'
import { SkillFilterRow } from '@/components/players/skill-filter-row'

type Props = {
  query: string
  onQueryChange: (v: string) => void
  isAdmin: boolean
  onAdd: () => void
  skillMode: SkillMode
  sortDir: 'asc' | 'desc'
  onSkillSelect: (mode: SkillMode) => void
  playersCount: number
}

export function PlayersListHeader({
  query,
  onQueryChange,
  isAdmin,
  onAdd,
  skillMode,
  sortDir,
  onSkillSelect,
  playersCount,
}: Props) {
  return (
    <View style={styles.wrap}>
      {isAdmin && (
        <View style={styles.addRow}>
          <HeaderAddButton onPress={onAdd} />
        </View>
      )}
      <PlayersSearchBar value={query} onChange={onQueryChange} />
      <SkillFilterRow mode={skillMode} dir={sortDir} onSelect={onSkillSelect} playersCount={playersCount} />
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
    marginTop: 8,
  },
})
