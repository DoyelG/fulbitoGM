import type { Player } from '@fulbito/types'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './open-match-add-player-sheet.styles'

type Props = {
  visible: boolean
  title: string
  candidates: Player[]
  myPlayerId: string | null
  onClose: () => void
  onPick: (playerId: string) => void
}

export function OpenMatchAddPlayerSheet({ visible, title, candidates, myPlayerId, onClose, onPick }: Props) {
  const { colors } = useAppTheme()
  const [query, setQuery] = useState('')

  const visiblePlayers = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return needle ? candidates.filter((player) => player.name.toLocaleLowerCase().includes(needle)) : candidates
  }, [candidates, query])

  const close = () => {
    setQuery('')
    onClose()
  }

  return (
    <BottomSheet visible={visible} title={title} closeLabel="Cerrar" onConfirm={close}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar jugador"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Buscar jugador"
        style={[styles.search, { color: colors.text, borderColor: colors.border }]}
      />
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {visiblePlayers.length === 0 && (
          <Text style={[styles.empty, { color: colors.muted }]} accessibilityLiveRegion="polite">
            {candidates.length === 0 ? 'No quedan jugadores para agregar.' : 'Ningún jugador coincide con la búsqueda.'}
          </Text>
        )}
        {visiblePlayers.map((player) => (
          <Pressable
            key={player.id}
            onPress={() => {
              setQuery('')
              onPick(player.id)
            }}
            accessibilityRole="button"
            accessibilityLabel={`Agregar a ${player.name}${player.id === myPlayerId ? ' (vos)' : ''}`}
            style={[styles.option, { borderBottomColor: colors.chipBorder }]}
          >
            <Text style={[styles.optionText, { color: colors.text }]} numberOfLines={1}>
              {player.name}
            </Text>
            {player.id === myPlayerId && (
              <Text style={[styles.meBadge, { backgroundColor: colors.primary, color: colors.onPrimary }]}>Vos</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  )
}
