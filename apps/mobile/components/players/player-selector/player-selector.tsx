import type { Player } from '@fulbito/types'
import { useState, type ReactNode } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import EmptyState, { type EmptyStateProps } from '@/components/ui/empty-state/empty-state'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './player-selector.styles'

type Props = {
  players: Player[]
  selectedIds: ReadonlySet<string>
  onChange: (selectedIds: Set<string>) => void
  hidePlayerCondition?: (player: Player) => boolean
  isMultiSelector?: boolean
  maxSelectedCount?: number
  renderSelectedPlayerAction?: (player: Player) => ReactNode
  maxHeight?: number
  emptyState?: Pick<EmptyStateProps, 'title' | 'description' | 'action'>
}

export default function PlayerSelector({
  players,
  selectedIds,
  onChange,
  hidePlayerCondition,
  isMultiSelector = true,
  maxSelectedCount,
  renderSelectedPlayerAction,
  maxHeight,
  emptyState = { title: 'No hay jugadores disponibles para seleccionar' },
}: Props) {
  const { colors, radii } = useAppTheme()
  const [playerQuery, setPlayerQuery] = useState('')

  const normalizedQuery = playerQuery.trim().toLowerCase()
  const availablePlayers = players.filter((player) => !hidePlayerCondition?.(player))
  const visiblePlayers = availablePlayers.filter((player) => player.name.toLowerCase().includes(normalizedQuery))

  const selectPlayer = (playerId: string) => {
    if (!isMultiSelector) {
      onChange(new Set([playerId]))
      return
    }
    const nextSelectedIds = new Set(selectedIds)
    if (nextSelectedIds.has(playerId)) nextSelectedIds.delete(playerId)
    else if (maxSelectedCount === undefined || nextSelectedIds.size < maxSelectedCount) nextSelectedIds.add(playerId)
    onChange(nextSelectedIds)
  }

  if (availablePlayers.length === 0) return <EmptyState icon="users" {...emptyState} />

  return (
    <View>
      <TextInput
        value={playerQuery}
        onChangeText={setPlayerQuery}
        placeholder="Buscar jugadores por nombre..."
        placeholderTextColor={colors.muted}
        accessibilityLabel="Buscar jugadores por nombre"
        style={[styles.searchInput, { color: colors.text, borderColor: colors.border, borderRadius: radii.sm }]}
      />
      <ScrollView style={maxHeight === undefined ? undefined : { maxHeight }} keyboardShouldPersistTaps="handled">
        {visiblePlayers.map((player) => {
          const isSelected = selectedIds.has(player.id)
          return (
            <View key={player.id} style={[styles.option, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={styles.name}
                onPress={() => selectPlayer(player.id)}
                accessibilityRole={isMultiSelector ? 'checkbox' : 'radio'}
                accessibilityLabel={player.name}
                accessibilityState={{ checked: isSelected }}
              >
                <Text style={[styles.name, { color: colors.text }]}>{player.name}</Text>
              </TouchableOpacity>
              {isSelected && renderSelectedPlayerAction?.(player)}
              {isSelected && (
                <Text style={[styles.check, { color: colors.brand }]} accessible={false}>
                  ✓
                </Text>
              )}
            </View>
          )
        })}
        {visiblePlayers.length === 0 && (
          <EmptyState icon="search" title="No se encontraron jugadores" description="Probá con otro nombre." />
        )}
      </ScrollView>
    </View>
  )
}
