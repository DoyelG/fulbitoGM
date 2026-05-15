import type { Match } from '@fulbito/types'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, FlatList, RefreshControl, StyleSheet, TextInput, View } from 'react-native'

import { DateFilterBar } from '@/components/history/dateFilterBar'
import { HistoryEmpty } from '@/components/history/historyEmpty'
import { HistoryError } from '@/components/history/historyError'
import { HistoryLoading } from '@/components/history/historyLoading'
import { MatchCard } from '@/components/history/matchCard'
import { ThemedView } from '@/components/themed-view'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { useMatchesData } from '@/hooks/use-matches-data'
import { useAppTheme } from '@/hooks/use-theme'

export default function HistoryScreen() {
  const router = useRouter()
  const isAdmin = useIsAdmin()
  const { colors } = useAppTheme()

  const { matches, players, loading, refreshing, error, reload, refresh, deleteMatch } =
    useMatchesData()

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMatches = matches.filter((m) => {
    const d = m.date.slice(0, 10)
    if (fromDate && d < fromDate) return false
    if (toDate && d > toDate) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const inTitle = m.name?.toLowerCase().includes(q) ?? false
      const inPlayers = [...m.teamA, ...m.teamB].some((p) =>
        p.name.toLowerCase().includes(q),
      )
      if (!inTitle && !inPlayers) return false
    }
    return true
  })

  const confirmDelete = useCallback(
    (match: Match) => {
      Alert.alert(
        'Confirmar eliminación',
        `¿Estás seguro de que querés eliminar este partido?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMatch(match.id)
              } catch (e) {
                Alert.alert(
                  'No se pudo eliminar',
                  e instanceof Error ? e.message : 'Revisá la API.',
                )
              }
            },
          },
        ],
      )
    },
    [deleteMatch],
  )

  if (loading) return <HistoryLoading />
  if (error) return <HistoryError message={error} onRetry={() => void reload()} />

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.screen}>
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.filterBar}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Buscar por título o jugador..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCorrect={false}
              />
              <DateFilterBar
                fromDate={fromDate}
                toDate={toDate}
                onChangeFrom={setFromDate}
                onChangeTo={setToDate}
                onClear={() => {
                  setFromDate('')
                  setToDate('')
                }}
              />
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.brand}
            />
          }
          contentContainerStyle={
            filteredMatches.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={<HistoryEmpty />}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              players={players}
              isAdmin={isAdmin}
              onEdit={() =>
                router.push({
                  pathname: '/(tabs)/history/edit/[id]',
                  params: { id: item.id },
                })
              }
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      </ThemedView>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filterBar: {
    marginBottom: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})
