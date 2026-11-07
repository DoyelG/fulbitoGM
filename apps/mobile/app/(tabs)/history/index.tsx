import type { Match } from '@fulbito/types'
import { parseMatchDate } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'

import { DateFilterBar } from '@/components/history/dateFilterBar'
import { HistoryError } from '@/components/history/historyError'
import { HistoryLoading } from '@/components/history/historyLoading'
import { MatchCard } from '@/components/history/matchCard'
import { MatchClipsModal } from '@/components/history/match-clips-modal'
import { PlayersSearchBar } from '@/components/players/players-search-bar'
import { VideoClipUploadModal } from '@/components/players/detail/video-clip-upload-modal'
import { ThemedView } from '@/components/themed-view'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { Spacing } from '@/constants/theme'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { useMatchesData } from '@/hooks/use-matches-data'
import { useVideoClipsData } from '@/hooks/use-video-clips-data'
import { useAppTheme } from '@/hooks/use-theme'

export default function HistoryScreen() {
  const router = useRouter()
  const canManage = useCanManageTournament()
  const { colors } = useAppTheme()

  const { matches, players, loading, refreshing, error, reload, refresh, deleteMatch } =
    useMatchesData()
  const { videoClips, addVideoClip, deleteVideoClip } = useVideoClipsData()

  const [videoUploadMatch, setVideoUploadMatch] = useState<Match | null>(null)
  const [viewClipsMatch, setViewClipsMatch] = useState<Match | null>(null)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        const matchDateOnly = parseMatchDate(match).date
        if (fromDate && matchDateOnly < fromDate) return false
        if (toDate && matchDateOnly > toDate) return false
        if (searchQuery) {
          const normalizedQuery = searchQuery.toLowerCase()
          const matchesTitle =
            match.name?.toLowerCase().includes(normalizedQuery) ?? false
          const matchesPlayerName = [...match.teamA, ...match.teamB].some(
            (player) => player.name.toLowerCase().includes(normalizedQuery),
          )
          if (!matchesTitle && !matchesPlayerName) return false
        }
        return true
      }),
    [matches, fromDate, toDate, searchQuery],
  )

  const { visibleItems: visibleMatches, hasMore, loadMore } = useInfiniteScroll(
    filteredMatches,
    { resetKey: `${fromDate}|${toDate}|${searchQuery}` },
  )

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
          data={visibleMatches}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footer} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.primaryText} />
              </View>
            ) : undefined
          }
          ListHeaderComponent={
            <View style={styles.filterBar}>
              <PlayersSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por título o jugador..."
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
              tintColor={colors.primaryText}
            />
          }
          contentContainerStyle={
            filteredMatches.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <EmptyState icon="clock" title="Sin partidos" description="Todavía no hay partidos registrados." />
            </View>
          }
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              players={players}
              canManage={canManage}
              clipCount={videoClips.filter((c) => c.matchId === item.id).length}
              onOpen={() => router.push({ pathname: '/(tabs)/history/[id]', params: { id: item.id } })}
              onEdit={() =>
                router.push({
                  pathname: '/(tabs)/history/edit/[id]',
                  params: { id: item.id },
                })
              }
              onDelete={() => confirmDelete(item)}
              onViewClips={() => setViewClipsMatch(item)}
            />
          )}
        />
      </ThemedView>

      <VideoClipUploadModal
        key={videoUploadMatch?.id ?? 'none'}
        visible={videoUploadMatch !== null}
        matches={videoUploadMatch ? [videoUploadMatch] : []}
        lockedMatchId={videoUploadMatch?.id}
        onSubmit={async (data, uri) => {
          await addVideoClip(data, uri)
          setVideoUploadMatch(null)
        }}
        onClose={() => setVideoUploadMatch(null)}
      />

      <MatchClipsModal
        visible={viewClipsMatch !== null}
        match={viewClipsMatch}
        clips={viewClipsMatch ? videoClips.filter((c) => c.matchId === viewClipsMatch.id) : []}
        canManage={canManage}
        onDelete={deleteVideoClip}
        onAddVideo={() => {
          setVideoUploadMatch(viewClipsMatch)
          setViewClipsMatch(null)
        }}
        onClose={() => setViewClipsMatch(null)}
      />
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
    paddingTop: Spacing.lg,
  },
  filterBar: {
    gap: 10,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
})
