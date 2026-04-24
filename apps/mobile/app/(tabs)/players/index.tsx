import type { Player } from '@fulbito/types'
import { calculateAllCurrentStreaks } from '@fulbito/utils'
import { useNavigation } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { Alert, FlatList, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { HeaderAddButton } from '@/components/players/header-add-button'
import { PlayerCard } from '@/components/players/player-card'
import { PlayersEmpty } from '@/components/players/players-empty'
import { PlayersError } from '@/components/players/players-error'
import { PlayersListHeader } from '@/components/players/players-list-header'
import { PlayersLoading } from '@/components/players/players-loading'
import { ThemedView } from '@/components/themed-view'
import { useAppTheme } from '@/hooks/use-theme'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { usePlayerSort } from '@/hooks/use-player-sort'
import { usePlayersData } from '@/hooks/use-players-data'

export default function PlayersScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const isAdmin = useIsAdmin()
  const { colors } = useAppTheme()

  const {
    players,
    matches,
    loading,
    refreshing,
    error,
    reload,
    refresh,
    deletePlayer,
  } = usePlayersData()

  const streaks = useMemo(() => calculateAllCurrentStreaks(matches), [matches])
  const { sortKey, sortDir, toggleSort, sortedPlayers } = usePlayerSort(players, streaks)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: isAdmin
        ? () => <HeaderAddButton onPress={() => router.push('/(tabs)/players/new')} />
        : () => null,
    })
  }, [navigation, isAdmin, router])

  const confirmDelete = useCallback(
    (player: Player) => {
      Alert.alert(
        'Confirmar eliminación',
        `¿Estás seguro de que querés eliminar a ${player.name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePlayer(player.id)
              } catch (e) {
                Alert.alert(
                  'No se pudo eliminar',
                  e instanceof Error ? e.message : 'Revisá sesión de admin o la API.',
                )
              }
            },
          },
        ],
      )
    },
    [deletePlayer],
  )

  if (loading) return <PlayersLoading />
  if (error) return <PlayersError message={error} onRetry={() => void reload()} />

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ThemedView style={styles.screen}>
        <FlatList
          data={sortedPlayers}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <PlayersListHeader
              total={players.length}
              sortKey={sortKey}
              sortDir={sortDir}
              onToggle={toggleSort}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.brand}
            />
          }
          contentContainerStyle={
            sortedPlayers.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={
            <PlayersEmpty
              isAdmin={isAdmin}
              onCreate={() => router.push('/(tabs)/players/new')}
            />
          }
          renderItem={({ item: player }) => (
            <PlayerCard
              player={player}
              streak={streaks[player.id] ?? { kind: null, count: 0 }}
              isAdmin={isAdmin}
              onView={() => router.push(`/(tabs)/players/${player.id}`)}
              onEdit={() => router.push(`/(tabs)/players/edit/${player.id}`)}
              onDelete={() => confirmDelete(player)}
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})
