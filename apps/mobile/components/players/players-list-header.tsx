import type { SkillMode } from '@fulbito/types'
import { StyleSheet, View } from 'react-native'

import { HeaderAddButton } from '@/components/players/header-add-button'
import { PlayersSearchBar } from '@/components/players/players-search-bar'
import { SkillFilterRow } from '@/components/players/skill-filter-row'

type Props = {
  query: string
  onQueryChange: (v: string) => void
  canManage: boolean
  onAdd: () => void
  skillMode: SkillMode
  sortDir: 'asc' | 'desc'
  onSkillSelect: (mode: SkillMode) => void
  playersCount: number
}

export function PlayersListHeader({
  query,
  onQueryChange,
  canManage,
  onAdd,
  skillMode,
  sortDir,
  onSkillSelect,
  playersCount,
}: Props) {
  return (
    <View style={styles.wrap}>
      <PlayersSearchBar value={query} onChange={onQueryChange} />
      <SkillFilterRow
        mode={skillMode}
        dir={sortDir}
        onSelect={onSkillSelect}
        playersCount={playersCount}
        action={canManage ? <HeaderAddButton onPress={onAdd} /> : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
})
