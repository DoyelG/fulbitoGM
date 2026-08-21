import { StyleSheet, View } from 'react-native'

import { HeaderAddButton } from '@/components/players/header-add-button'
import { PlayersSearchBar } from '@/components/players/players-search-bar'
import { PositionFilterRow, type PositionFilter } from '@/components/players/position-filter-row'

type Props = {
  query: string
  onQueryChange: (v: string) => void
  positions: string[]
  position: PositionFilter
  onPositionChange: (v: PositionFilter) => void
  isAdmin: boolean
  onAdd: () => void
}

/** Cabecera de la lista: acción de agregar (admin) + buscador + filtro por posición. */
export function PlayersListHeader({
  query,
  onQueryChange,
  positions,
  position,
  onPositionChange,
  isAdmin,
  onAdd,
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
  },
})
