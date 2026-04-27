import { StyleSheet, View } from 'react-native'

import { PlayersSearchBar } from '@/components/players/players-search-bar'
import { PositionFilterRow, type PositionFilter } from '@/components/players/position-filter-row'

type Props = {
  query: string
  onQueryChange: (v: string) => void
  positions: string[]
  position: PositionFilter
  onPositionChange: (v: PositionFilter) => void
}

/** Cabecera de la lista: buscador + filtro por posición. */
export function PlayersListHeader({
  query,
  onQueryChange,
  positions,
  position,
  onPositionChange,
}: Props) {
  return (
    <View style={styles.wrap}>
      <PlayersSearchBar value={query} onChange={onQueryChange} />
      <PositionFilterRow
        positions={positions}
        value={position}
        onChange={onPositionChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginBottom: 12,
  },
})
