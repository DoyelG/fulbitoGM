import Feather from '@expo/vector-icons/Feather'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { GoalSevenBar } from '@/components/players/goal-seven-bar'
import { SkillBadge } from '@/components/players/skill-badge'
import { StreakBadge } from '@/components/players/streak-badge'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import { deletePlayerRequest, loadPlayersAndMatches } from '@/lib/api'
import { useColorScheme } from '@/hooks/use-color-scheme'
import type { Match, Player } from '@fulbito/types'
import { calculateAllCurrentStreaks } from '@fulbito/utils'
import { useNavigation } from '@react-navigation/native'

const BRAND = '#7c3aed'
const BRAND_DIM = 'rgba(124, 58, 237, 0.12)'

/** Hasta tener login en mobile, poné EXPO_PUBLIC_DEV_IS_ADMIN=true para ver acciones de admin. */
function useIsAdmin(): boolean {
  return process.env.EXPO_PUBLIC_DEV_IS_ADMIN === 'true'
}

type SortKey = 'skill' | 'streak' | 'goal7'

function SortChip({
  label,
  active,
  dir,
  onPress,
  isDark,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onPress: () => void
  isDark: boolean
}) {
  const arrow = active ? (dir === 'asc' ? ' ▲' : ' ▼') : ''
  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active
            ? isDark
              ? 'rgba(124, 58, 237, 0.28)'
              : BRAND_DIM
            : isDark
              ? 'rgba(255,255,255,0.06)'
              : '#f3f4f6',
          borderColor: active ? BRAND : isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
        },
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}>
      <ThemedText
        style={[
          styles.chipText,
          active && { color: isDark ? '#e9d5ff' : BRAND },
        ]}>
        {label}
        {arrow}
      </ThemedText>
    </Pressable>
  )
}

function PlayerAvatar({
  name,
  photoUrl,
  isDark,
}: {
  name: string
  photoUrl?: string
  isDark: boolean
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  if (photoUrl) {
    return (
      <View style={styles.avatarRing}>
        <Image
          source={{ uri: photoUrl }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
      </View>
    )
  }
  return (
    <View style={styles.avatarRing}>
      <View
        style={[
          styles.avatar,
          styles.avatarPlaceholder,
          { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : BRAND_DIM },
        ]}>
        <ThemedText style={[styles.avatarLetter, { color: BRAND }]}>{initial}</ThemedText>
      </View>
    </View>
  )
}

export default function PlayersScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const colorScheme = useColorScheme()
  const isAdmin = useIsAdmin()

  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sortKey, setSortKey] = useState<SortKey>('skill')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await loadPlayersAndMatches()
      setPlayers(data.players)
      setMatches(data.matches)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: isAdmin
        ? () => (
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/players/new')
              }}
              hitSlop={12}
              style={({ pressed }) => [styles.headerAddPill, pressed && { opacity: 0.9 }]}>
              <Feather name="user-plus" size={16} color="#fff" />
              <ThemedText style={styles.headerBtnText}>Agregar</ThemedText>
            </Pressable>
          )
        : () => null,
    })
  }, [navigation, isAdmin, router])

  useEffect(() => {
    void load()
  }, [load])

  const streaks = useMemo(() => calculateAllCurrentStreaks(matches), [matches])

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('desc')
      }
    },
    [sortKey],
  )

  const sortedPlayers = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...players].sort((a, b) => {
      const sa = a.skill ?? -Infinity
      const sb = b.skill ?? -Infinity
      const stA = streaks[a.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
      const stB = streaks[b.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
      const streakValue = (st: { kind: 'win' | 'loss' | null; count: number }) =>
        st.kind === 'win' ? st.count : st.kind === 'loss' ? -st.count : 0
      const goalA = stA.kind === 'win' ? stA.count : 0
      const goalB = stB.kind === 'win' ? stB.count : 0

      let av: number
      let bv: number
      switch (sortKey) {
        case 'skill':
          av = sa
          bv = sb
          break
        case 'streak':
          av = streakValue(stA)
          bv = streakValue(stB)
          break
        case 'goal7':
          av = goalA
          bv = goalB
          break
      }
      if (av === bv) return 0
      return av > bv ? dir : -dir
    })
  }, [players, streaks, sortKey, sortDir])

  const isDark = colorScheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124, 58, 237, 0.12)'
  const muted = isDark ? '#9ca3af' : '#6b7280'

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
                await deletePlayerRequest(player.id)
                await load()
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
    [load],
  )

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <View style={[styles.stateIconWrap, isDark && styles.stateIconWrapDark]}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.loadingTitle}>
          Cargando plantel
        </ThemedText>
        <ThemedText style={[styles.loadingText, { color: muted }]}>Un momento…</ThemedText>
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <View style={[styles.stateIconWrap, isDark && styles.stateIconWrapDark]}>
          <Feather name="wifi-off" size={32} color="#f97316" />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.errorTitle}>
          No se pudo conectar
        </ThemedText>
        <ThemedText style={[styles.errorText, { color: muted }]}>{error}</ThemedText>
        <Pressable
          onPress={() => void load()}
          style={({ pressed }) => [styles.retryBtn, pressed && styles.retryBtnPressed]}>
          <ThemedText style={styles.retryBtnText}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ThemedView style={styles.screen}>
        <FlatList
          data={sortedPlayers}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.listHeaderTop}>
                <ThemedText style={[styles.kicker, { color: muted }]}>Plantel</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.countLine}>
                  {players.length} {players.length === 1 ? 'jugador' : 'jugadores'}
                </ThemedText>
              </View>
              <ThemedText style={[styles.sortLabel, { color: muted }]}>Ordenar por</ThemedText>
              <View style={styles.sortRow}>
                <SortChip
                  label="Habilidad"
                  active={sortKey === 'skill'}
                  dir={sortDir}
                  isDark={isDark}
                  onPress={() => toggleSort('skill')}
                />
                <SortChip
                  label="Racha"
                  active={sortKey === 'streak'}
                  dir={sortDir}
                  isDark={isDark}
                  onPress={() => toggleSort('streak')}
                />
                <SortChip
                  label="Objetivo (7W)"
                  active={sortKey === 'goal7'}
                  dir={sortDir}
                  isDark={isDark}
                  onPress={() => toggleSort('goal7')}
                />
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true)
                void load()
              }}
              tintColor={BRAND}
            />
          }
          contentContainerStyle={
            sortedPlayers.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIcon, isDark && styles.emptyIconDark]}>
                <Feather name="user-plus" size={36} color={BRAND} style={{ opacity: 0.9 }} />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
                Sin jugadores todavía
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: muted }]}>
                No hay jugadores cargados.
                {isAdmin ? ' Creá el primero con el botón Agregar arriba.' : ''}
              </ThemedText>
              {isAdmin && (
                <Pressable
                  onPress={() => router.push('/(tabs)/players/new')}
                  style={({ pressed }) => [styles.emptyCta, pressed && { opacity: 0.9 }]}>
                  <ThemedText style={styles.emptyCtaText}>Nuevo jugador</ThemedText>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </Pressable>
              )}
            </View>
          }
          renderItem={({ item: player }) => {
            const st = streaks[player.id] ?? {
              kind: null as 'win' | 'loss' | null,
              count: 0,
            }
            const winGoalProgress = st.kind === 'win' ? st.count : 0

            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? '#2a2d32' : '#ffffff',
                    borderColor,
                  },
                  Platform.select({
                    ios: {
                      shadowColor: isDark ? '#000' : '#4c1d95',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isDark ? 0.35 : 0.08,
                      shadowRadius: 12,
                    },
                    android: { elevation: isDark ? 2 : 3 },
                    default: {},
                  }),
                ]}>
                <View style={styles.cardTop}>
                  <PlayerAvatar name={player.name} photoUrl={player.photoUrl} isDark={isDark} />
                  <View style={styles.cardMain}>
                    <Pressable onPress={() => router.push(`/(tabs)/players/${player.id}`)}>
                      <ThemedText type="defaultSemiBold" style={styles.playerName}>
                        {player.name}
                      </ThemedText>
                    </Pressable>
                    <ThemedText style={[styles.position, { color: muted }]} numberOfLines={1}>
                      {player.position}
                    </ThemedText>
                    <View style={styles.metaRow}>
                      <SkillBadge skill={player.skill ?? 'unknown'} />
                    </View>
                    <View style={styles.statsBlock}>
                      <View style={styles.statCol}>
                        <ThemedText style={[styles.statLabel, { color: muted }]}>Racha</ThemedText>
                        {st.kind ? (
                          <StreakBadge kind={st.kind} count={st.count} />
                        ) : (
                          <ThemedText style={[styles.dash, { color: muted }]}>—</ThemedText>
                        )}
                      </View>
                      <View style={styles.statCol}>
                        <ThemedText style={[styles.statLabel, { color: muted }]}>Objetivo 7W</ThemedText>
                        <GoalSevenBar winCount={winGoalProgress} />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={[styles.actionsRow, { borderTopColor: borderColor }]}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPill,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : BRAND_DIM },
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => router.push(`/(tabs)/players/${player.id}`)}
                    hitSlop={6}>
                    <Feather name="eye" size={17} color={Colors[colorScheme ?? 'light'].icon} />
                  </Pressable>
                  {isAdmin && (
                    <>
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionPill,
                          { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : BRAND_DIM },
                          pressed && { opacity: 0.85 },
                        ]}
                        onPress={() => router.push(`/(tabs)/players/edit/${player.id}`)}
                        hitSlop={6}>
                        <Feather name="edit-2" size={17} color={BRAND} />
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionPill,
                          { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.1)' },
                          pressed && { opacity: 0.85 },
                        ]}
                        onPress={() => confirmDelete(player)}
                        hitSlop={6}>
                        <Feather name="trash-2" size={17} color="#f87171" />
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            )
          }}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stateIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: BRAND_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stateIconWrapDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  loadingTitle: {
    fontSize: 20,
    marginTop: 8,
  },
  loadingText: {
    marginTop: 6,
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: BRAND,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  retryBtnPressed: {
    transform: [{ scale: 0.98 }],
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  listHeader: {
    marginBottom: 8,
  },
  listHeaderTop: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 4,
  },
  countLine: {
    fontSize: 16,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: BRAND_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconDark: {
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
  },
  emptyTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyCta: {
    marginTop: 20,
    backgroundColor: BRAND,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyCtaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.25)',
    borderRadius: 999,
    padding: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardMain: {
    flex: 1,
    marginLeft: 10,
  },
  playerName: {
    color: BRAND,
    fontSize: 18,
    marginBottom: 2,
  },
  position: {
    fontSize: 14,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  statsBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  statCol: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dash: {
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionPill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  headerAddPill: {
    marginRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BRAND,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
})
