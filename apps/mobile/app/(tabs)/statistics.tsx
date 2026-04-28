import { useNavigation, useRouter } from 'expo-router'
import { useLayoutEffect, useMemo } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { StatFilterTabs } from '@/components/statistics/stat-filter-tabs'
import { StatPlayerCard } from '@/components/statistics/stat-player-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { usePlayersData } from '@/hooks/use-players-data'
import { usePlayerStatistics } from '@/hooks/use-player-statistics'
import { useAppTheme } from '@/hooks/use-theme'

export default function StatisticsScreen() {
  const router = useRouter()
  const navigation = useNavigation()  
  const { colors } = useAppTheme()
  const { players, matches, loading, refreshing, error, refresh, reload } = usePlayersData()
  const { activeTab, setActiveTab, sortedStats } = usePlayerStatistics(players, matches)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Estadísticas',
    })
  }, [navigation])

  const header = useMemo(
    () => (
      <>
        <StatFilterTabs activeTab={activeTab} onChange={setActiveTab} />
      </>
    ),
    [activeTab, setActiveTab],
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  content: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  stateText: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 22,
    textAlign: 'center',
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 15,
  },
  retryText: {
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
})
