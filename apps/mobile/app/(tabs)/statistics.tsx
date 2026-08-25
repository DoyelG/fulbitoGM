import { useNavigation, useRouter } from 'expo-router'
import { useLayoutEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AwardsList } from '@/components/awards/awards-list'
import { styles } from '@/components/statistics/styles/statics.styles'

import { StatFilterTabs } from '@/components/statistics/stat-filter-tabs'
import { StatPlayerCard } from '@/components/statistics/stat-player-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAnnualAwards } from '@/hooks/use-annual-awards'
import { usePlayersData } from '@/hooks/use-players-data'
import { usePlayerStatistics } from '@/hooks/use-player-statistics'
import { useAppTheme } from '@/hooks/use-theme'

type StatsView = 'ranking' | 'awards'

export default function StatisticsScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { colors } = useAppTheme()
  const [view, setView] = useState<StatsView>('ranking')
  const [yearPickerOpen, setYearPickerOpen] = useState(false)
  const { players, matches, loading, refreshing, error, refresh, reload } = usePlayersData()
  const { activeTab, setActiveTab, sortedStats } = usePlayerStatistics(players, matches)
  const { currentYear, availableYears, onSelectYear, winners } = useAnnualAwards(players, matches)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Estadísticas',
    })
  }, [navigation])

  const header = useMemo(
    () => (
      <>
        <View style={styles.viewSwitch}>
          {(['ranking', 'awards'] as const).map((key) => {
            const selected = view === key
            return (
              <Pressable
                key={key}
                onPress={() => setView(key)}
                style={[styles.viewTab, selected && { borderColor: colors.brand }]}>
                <ThemedText style={[styles.viewTabText, { color: selected ? colors.brand : colors.muted }]}>
                  {key === 'ranking' ? 'RANKING' : 'AWARDS'}
                </ThemedText>
              </Pressable>
            )
          })}
        </View>
        {view === 'ranking' ? (
          <StatFilterTabs activeTab={activeTab} onChange={setActiveTab} />
        ) : (
          <Pressable
            onPress={() => setYearPickerOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Season ${currentYear}`}
            accessibilityHint="Opens the list of seasons to pick another year"
            style={[styles.yearBadge, { backgroundColor: colors.secondary }]}>
            <ThemedText style={styles.yearBadgeText}>SEASON {currentYear} ▾</ThemedText>
          </Pressable>
        )}
      </>
    ),
    [view, activeTab, setActiveTab, colors.brand, colors.muted, colors.secondary, currentYear],
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ThemedView style={styles.screen}>
          {header}
          <ThemedText style={[styles.stateText, { color: colors.muted }]}>
            Cargando estadísticas...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ThemedView style={styles.screen}>
          {header}
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <ThemedText onPress={() => void reload()} style={[styles.retryText, { color: colors.brand }]}>
            Reintentar
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (view === 'awards') {
    return (
      <AwardsList
        winners={winners}
        header={header}
        refreshing={refreshing}
        onRefresh={refresh}
        availableYears={availableYears}
        currentYear={currentYear}
        onSelectYear={onSelectYear}
        onPressPlayer={(playerId) => router.push(`/(tabs)/players/${playerId}`)}
        yearPickerOpen={yearPickerOpen}
        onCloseYearPicker={() => setYearPickerOpen(false)}
      />
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ThemedView style={styles.screen}>
        <FlatList
          data={sortedStats}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <ThemedText style={[styles.stateText, { color: colors.muted }]}>
              No hay estadísticas disponibles.
            </ThemedText>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.brand}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={sortedStats.length === 0 ? styles.emptyContent : styles.content}
          renderItem={({ item, index }) => (
            <StatPlayerCard
              stat={item}
              rank={index + 1}
              activeTab={activeTab}
              onPress={() => router.push(`/(tabs)/players/${item.id}`)}
            />
          )}
        />
      </ThemedView>
    </SafeAreaView>
  )
}