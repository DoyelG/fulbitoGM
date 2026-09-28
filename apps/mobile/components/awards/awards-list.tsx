import { ReactElement } from 'react'
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { AwardPodium, ChampionshipProgress, HallOfFameEntry, SeasonChampion } from '@fulbito/utils'

import { AwardCard } from '@/components/awards/award-card'
import { ChampionsSection } from '@/components/awards/champions-section'
import { HallOfFame } from '@/components/awards/hall-of-fame'
import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { sheetStyles } from '@/components/match/matchForm/sharedStyles'
import { styles } from '@/components/statistics/styles/statics.styles'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { HALL_OF_FAME, type SeasonSelection } from '@/hooks/use-annual-awards'
import { AWARD_ICONS } from '@/constants/award-icons'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  podiums: AwardPodium[]
  championship: ChampionshipProgress
  seasonChampions: SeasonChampion[]
  hallOfFame: HallOfFameEntry[]
  isHallOfFame: boolean
  header: ReactElement
  refreshing: boolean
  onRefresh: () => Promise<void>
  availableYears: number[]
  selection: SeasonSelection
  onSelectSeason: (selection: SeasonSelection) => void
  onPressPlayer: (playerId: string) => void
  yearPickerOpen: boolean
  onCloseYearPicker: () => void
}

export function AwardsList({
  podiums,
  championship,
  seasonChampions,
  hallOfFame,
  isHallOfFame,
  header,
  refreshing,
  onRefresh,
  availableYears,
  selection,
  onSelectSeason,
  onPressPlayer,
  yearPickerOpen,
  onCloseYearPicker,
}: Props) {
  const { colors } = useAppTheme()

  const listHeader = (
    <>
      {header}
      <ChampionsSection
        championship={championship}
        champions={seasonChampions}
        seasonYear={isHallOfFame ? null : (selection as number)}
        onPressPlayer={onPressPlayer}
      />
      {isHallOfFame && <HallOfFame entries={hallOfFame} onPressPlayer={onPressPlayer} />}
    </>
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
      <ThemedView style={styles.screen}>
        <FlatList
          data={isHallOfFame ? [] : podiums}
          keyExtractor={(item) => item.def.key}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            isHallOfFame ? null : (
              <ThemedText style={[styles.stateText, { color: colors.muted }]}>
                Todavía no hay premios este año.
              </ThemedText>
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.brand} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={podiums.length === 0 && !isHallOfFame ? styles.emptyContent : styles.content}
          renderItem={({ item }) => (
            <AwardCard
              title={item.def.title}
              subtitle={item.def.subtitle}
              icon={AWARD_ICONS[item.def.key]}
              accent={item.def.accent}
              winnerName={item.winner.row.name}
              winnerPhotoUrl={item.winner.row.photoUrl}
              value={item.winner.value}
              unitLabel={item.def.unitLabel}
              runnersUp={item.runnersUp}
              onPress={() => onPressPlayer(item.winner.row.id)}
              onPressPlayer={onPressPlayer}
            />
          )}
        />
      </ThemedView>

      <BottomSheet
        visible={yearPickerOpen}
        title="Elegí la temporada"
        onConfirm={onCloseYearPicker}
        containerStyle={styles.yearSheet}>
        <ScrollView>
          {availableYears.map((y) => {
            const selected = y === selection
            return (
              <Pressable
                key={y}
                style={[sheetStyles.option, { borderBottomColor: colors.border }]}
                onPress={() => {
                  onSelectSeason(y)
                  onCloseYearPicker()
                }}
                accessibilityRole="button"
                accessibilityLabel={`Temporada ${y}`}
                accessibilityState={{ selected }}>
                <ThemedText style={[sheetStyles.optionText, { color: colors.text }]}>TEMPORADA {y}</ThemedText>
                {selected && (
                  <ThemedText style={{ color: colors.brand, fontWeight: '700', fontSize: 16 }}>✓</ThemedText>
                )}
              </Pressable>
            )
          })}

          <Pressable
            style={[sheetStyles.option, { borderBottomWidth: 0 }]}
            onPress={() => {
              onSelectSeason(HALL_OF_FAME)
              onCloseYearPicker()
            }}
            accessibilityRole="button"
            accessibilityLabel="Hall of Fame"
            accessibilityState={{ selected: isHallOfFame }}>
            <ThemedText style={[sheetStyles.optionText, { color: colors.text }]}>🏆 HALL OF FAME</ThemedText>
            {isHallOfFame && (
              <ThemedText style={{ color: colors.brand, fontWeight: '700', fontSize: 16 }}>✓</ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  )
}
