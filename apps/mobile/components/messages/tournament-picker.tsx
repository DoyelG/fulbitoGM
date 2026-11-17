import { Ionicons } from '@expo/vector-icons'
import type { MyTournament } from '@fulbito/types'
import { unreadCommentsLabel } from '@fulbito/utils'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { useAppTheme } from '@/hooks/use-theme'

import { styles, TRIGGER_HEIGHT } from './tournament-picker.styles'

const TRIGGER_HIT_SLOP = (44 - TRIGGER_HEIGHT) / 2

type Props = {
  tournaments: MyTournament[]
  selectedId: string | null
  unreadByTournament: Record<string, number>
  onSelect: (tournamentId: string) => void
}

function UnreadCount({ count }: { count: number }) {
  const { colors } = useAppTheme()
  if (count <= 0) return null
  return (
    <View style={[styles.count, { backgroundColor: colors.secondaryText }]} accessible={false}>
      <Text style={styles.countText}>{count > 99 ? '99+' : count}</Text>
    </View>
  )
}

function TournamentPhoto({ photoUrl, onDark }: { photoUrl?: string; onDark: boolean }) {
  const { colors } = useAppTheme()
  return (
    <View style={[styles.photo, { backgroundColor: onDark ? colors.primarySoftStrong : colors.primarySoft }]}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.photo} contentFit="cover" accessible={false} />
      ) : (
        <Ionicons name="trophy-outline" size={14} color={onDark ? colors.onPrimary : colors.primaryText} />
      )}
    </View>
  )
}

export function TournamentPicker({ tournaments, selectedId, unreadByTournament, onSelect }: Props) {
  const { colors } = useAppTheme()
  const [isOpen, setIsOpen] = useState(false)
  const selected = tournaments.find(({ tournament }) => tournament.id === selectedId) ?? null
  const canChoose = tournaments.length > 1
  const unreadElsewhere = tournaments.reduce(
    (total, { tournament }) =>
      tournament.id === selectedId ? total : total + (unreadByTournament[tournament.id] ?? 0),
    0,
  )

  if (!selected) return null

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={!canChoose}
        hitSlop={TRIGGER_HIT_SLOP}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: colors.primary, borderColor: colors.primary },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Torneo: ${selected.tournament.name}${
          unreadElsewhere > 0 ? `. ${unreadCommentsLabel(unreadElsewhere)} en otros torneos` : ''
        }`}
        accessibilityHint={canChoose ? 'Abre la lista para elegir otro torneo' : undefined}
        accessibilityState={{ disabled: !canChoose }}
      >
        <TournamentPhoto photoUrl={selected.tournament.photoUrl} onDark />
        <Text style={[styles.name, { color: colors.onPrimary }]} numberOfLines={1}>
          {selected.tournament.name}
        </Text>
        <UnreadCount count={unreadElsewhere} />
        {canChoose && <Ionicons name="chevron-down" size={16} color={colors.onPrimary} />}
      </Pressable>

      <BottomSheet visible={isOpen} title="Elegí un torneo" closeLabel="Cerrar" onConfirm={() => setIsOpen(false)}>
        <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetContent}>
          {tournaments.map(({ tournament }) => {
            const isSelected = tournament.id === selectedId
            const unread = unreadByTournament[tournament.id] ?? 0
            return (
              <Pressable
                key={tournament.id}
                onPress={() => {
                  onSelect(tournament.id)
                  setIsOpen(false)
                }}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: isSelected || pressed ? colors.primarySoft : 'transparent' },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${tournament.name}${unread > 0 ? `. ${unreadCommentsLabel(unread)}` : ''}`}
                accessibilityState={{ selected: isSelected }}
              >
                <TournamentPhoto photoUrl={tournament.photoUrl} onDark={false} />
                <Text style={[styles.optionName, { color: colors.text }]} numberOfLines={1}>
                  {tournament.name}
                </Text>
                <UnreadCount count={unread} />
                {isSelected && <Ionicons name="checkmark" size={20} color={colors.primaryText} />}
              </Pressable>
            )
          })}
        </ScrollView>
      </BottomSheet>
    </>
  )
}
