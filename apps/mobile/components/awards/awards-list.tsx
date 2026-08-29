import { ReactElement } from 'react'
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AwardCard } from '@/components/awards/award-card'
import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { sheetStyles } from '@/components/match/matchForm/sharedStyles'
import { styles } from '@/components/statistics/styles/statics.styles'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import type { AwardWinner } from '@/hooks/use-annual-awards'
import { AWARD_ICONS } from '@/constants/award-icons'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  winners: AwardWinner[]
  header: ReactElement
  refreshing: boolean
  onRefresh: () => Promise<void>
  availableYears: number[]
  currentYear: number
  onSelectYear: (year: number) => void
  onPressPlayer: (playerId: string) => void
  yearPickerOpen: boolean
  onCloseYearPicker: () => void
}

export function AwardsList({
  winners,
  header,
  refreshing,
  onRefresh,
  availableYears,
  currentYear,
  onSelectYear,
  onPressPlayer,
  yearPickerOpen,
  onCloseYearPicker,
}: Props) {
  const { colors } = useAppTheme()

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ThemedView style={styles.screen}>
        <FlatList
          data={winners}
          keyExtractor={(item) => item.def.key}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <ThemedText style={[styles.stateText, { color: colors.muted }]}>
              No awards available yet this year.
            </ThemedText>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.brand} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={winners.length === 0 ? styles.emptyContent : styles.content}
          renderItem={({ item }) => (
            <AwardCard
              title={item.def.title}
              subtitle={item.def.subtitle}
              icon={AWARD_ICONS[item.def.key]}
              accent={item.def.accent}
              winnerName={item.row.name}
              winnerPhotoUrl={item.row.photoUrl}
              value={item.value}
              unitLabel={item.def.unitLabel}
              onPress={() => onPressPlayer(item.row.id)}
            />
          )}
        />
      </ThemedView>

      <BottomSheet
        visible={yearPickerOpen}
        title="Select season"
        onConfirm={onCloseYearPicker}
        containerStyle={styles.yearSheet}>
        <ScrollView>
          {availableYears.map((y, index) => {
            const selected = y === currentYear
            const isLast = index === availableYears.length - 1
            return (
              <Pressable
                key={y}
                style={[sheetStyles.option, { borderBottomColor: colors.border }, isLast && { borderBottomWidth: 0 }]}
                onPress={() => {
                  onSelectYear(y)
                  onCloseYearPicker()
                }}
                accessibilityRole="button"
                accessibilityLabel={`Season ${y}`}
                accessibilityState={{ selected }}>
                <ThemedText style={[sheetStyles.optionText, { color: colors.text }]}>SEASON {y}</ThemedText>
                {selected && <ThemedText style={{ color: colors.brand, fontWeight: '700', fontSize: 16 }}>✓</ThemedText>}
              </Pressable>
            )
          })}
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  )
}
