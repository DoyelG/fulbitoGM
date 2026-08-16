import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal as RNModal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useVideoPlayer, VideoView } from 'expo-video'
import { getGoalkeeping } from '@fulbito/utils'
import type { VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'

import { PlayerAvatar } from '@/components/players/player-avatar'
import { StreakBadge } from '@/components/players/streak-badge'
import { PlayerSkillBars } from '@/components/players/detail/player-skill-bars'
import { PlayerStatsGrid } from '@/components/players/detail/player-stats-grid'
import { RecentMatchRow } from '@/components/players/detail/recent-match-row'
import { VideoClipCard } from '@/components/players/detail/video-clip-card'
import { VideoClipUploadModal } from '@/components/players/detail/video-clip-upload-modal'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { usePlayerDetail } from '@/hooks/use-player-detail'
import { useVideoClipsData } from '@/hooks/use-video-clips-data'
import { useMatchesData } from '@/hooks/use-matches-data'
import { useAppTheme } from '@/hooks/use-theme'
import { Fonts, Radii, Spacing } from '@/constants/theme'

const AVATAR_SIZE = 80
const RECENT_MAX = 10

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const router = useRouter()
  const isAdmin = useIsAdmin()
  const { colors, isDark, shadows } = useAppTheme()

  const { player, stats, streak, catSkills, overallAvg, loading, refreshing, error, refresh, reload } =
    usePlayerDetail(id)

  const isAdminUser = isAdmin // already computed above via useIsAdmin()
  const { matches: allMatches } = useMatchesData()
  const { videoClips, addVideoClip, deleteVideoClip } = useVideoClipsData()
  const [clipFilter, setClipFilter] = useState<VideoClipCategory | 'all'>('all')
  const [uploadVisible, setUploadVisible] = useState(false)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)

  const playerClips = useMemo(
    () => videoClips.filter(c => c.playerIds.includes(id)),
    [videoClips, id],
  )
  const filteredClips = useMemo(
    () => (clipFilter === 'all' ? playerClips : playerClips.filter(c => c.category === clipFilter)),
    [playerClips, clipFilter],
  )
  const matchById = useMemo(() => new Map(allMatches.map(m => [m.id, m])), [allMatches])

  const clipPlayer = useVideoPlayer(playbackUrl ?? '', p => { p.loop = false })

  const handleDeleteClip = (clipId: string, label: string) => {
    Alert.alert('Eliminar clip', `¿Eliminar "${label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void deleteVideoClip(clipId) },
    ])
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: player?.name ?? 'Jugador',
      headerRight: isAdmin
        ? () => (
            <Pressable
              onPress={() => router.push(`/(tabs)/players/edit/${id}`)}
              style={styles.editBtn}>
              <MaterialIcons name="edit" size={20} color={colors.brand} />
            </Pressable>
          )
        : undefined,
    })
  }, [navigation, player?.name, isAdmin, router, id, colors.brand])

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ActivityIndicator color={colors.brand} size="large" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable onPress={() => void reload()} style={[styles.retryBtn, { backgroundColor: colors.brand }]}>
          <ThemedText style={styles.retryText}>Reintentar</ThemedText>
        </Pressable>
      </SafeAreaView>
    )
  }

  if (!player) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ThemedText style={styles.errorText}>Jugador no encontrado.</ThemedText>
        <Pressable onPress={() => router.back()} style={[styles.retryBtn, { backgroundColor: colors.brand }]}>
          <ThemedText style={styles.retryText}>Volver</ThemedText>
        </Pressable>
      </SafeAreaView>
    )
  }

  const recentSlice = stats.recent.slice(0, RECENT_MAX)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ThemedView style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.brand}
            />
          }>

          {/* ── Hero ─────────────────────────────────────────── */}
          <LinearGradient
            colors={['#7C3AED', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.hero}>
            {/* Izquierda: avatar + nombre + posición + racha */}
            <View style={styles.heroLeft}>
              <PlayerAvatar name={player.name} photoUrl={player.photoUrl} size={AVATAR_SIZE} />
              <View style={styles.heroInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.heroMeta}>
                  <Text style={styles.position}>{player.position}</Text>
                  {streak.kind ? (
                    <StreakBadge kind={streak.kind} count={streak.count} />
                  ) : null}
                </View>
              </View>
            </View>
            {/* Derecha: skill overall */}
            <View style={styles.skillPill}>
              <Text style={styles.skillPillLabel}>OVERALL</Text>
              <Text style={styles.skillPillText}>Lv {overallAvg.toFixed(1)}</Text>
            </View>
          </LinearGradient>

          {/* ── Stats ────────────────────────────────────────── */}
          <SectionTitle title="Estadísticas" />
          <PlayerStatsGrid stats={stats} />

          {/* ── Habilidades ──────────────────────────────────── */}
          <SectionTitle title="Habilidades" />
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
              shadows.card(isDark),
            ]}>
            <PlayerSkillBars skills={catSkills} goalkeeping={getGoalkeeping(player)} />
          </View>

          {/* ── Últimos partidos ─────────────────────────────── */}
          {recentSlice.length > 0 ? (
            <>
              <SectionTitle title={`Últimos partidos (${stats.matches})`} />
              <View
                style={[
                  styles.card,
                  styles.matchesCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  shadows.card(isDark),
                ]}>
                {recentSlice.map((m, i) => (
                  <RecentMatchRow
                    key={m.id}
                    match={m}
                    showBorder={i < recentSlice.length - 1}
                  />
                ))}
              </View>
            </>
          ) : (
            <>
              <SectionTitle title="Últimos partidos" />
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialIcons name="sports-soccer" size={32} color={colors.muted} />
                <ThemedText style={[styles.emptyText, { color: colors.muted }]}>
                  Sin partidos registrados
                </ThemedText>
              </View>
            </>
          )}

          {/* ── Clips ────────────────────────────────────────── */}
          <SectionTitle title="Clips" />
          <View style={styles.clipFilterRow}>
            <Pressable
              onPress={() => setClipFilter('all')}
              style={[styles.clipFilterChip, { borderColor: clipFilter === 'all' ? colors.brand : colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Todos los clips"
              accessibilityState={{ selected: clipFilter === 'all' }}>
              <ThemedText style={{ color: colors.text }}>Todos</ThemedText>
            </Pressable>
            {VIDEO_CLIP_CATEGORIES.map(c => (
              <Pressable
                key={c.value}
                onPress={() => setClipFilter(c.value)}
                style={[styles.clipFilterChip, { borderColor: clipFilter === c.value ? colors.brand : colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={c.label}
                accessibilityState={{ selected: clipFilter === c.value }}>
                <ThemedText style={{ color: colors.text }}>{c.icon} {c.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          {isAdminUser && (
            <Pressable
              onPress={() => setUploadVisible(true)}
              style={[styles.uploadClipBtn, { backgroundColor: colors.brand }]}
              accessibilityRole="button"
              accessibilityLabel="Subir clip">
              <ThemedText style={styles.uploadClipBtnText}>+ Subir clip</ThemedText>
            </Pressable>
          )}

          {filteredClips.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="movie" size={32} color={colors.muted} />
              <ThemedText style={[styles.emptyText, { color: colors.muted }]}>
                Sin clips para este jugador
              </ThemedText>
            </View>
          ) : (
            <View style={styles.clipsGrid}>
              {filteredClips.map(clip => (
                <VideoClipCard
                  key={clip.id}
                  clip={clip}
                  match={matchById.get(clip.matchId)}
                  isAdmin={isAdminUser}
                  onOpen={() => setPlaybackUrl(clip.url)}
                  onDelete={() => handleDeleteClip(clip.id, clip.title || 'clip')}
                />
              ))}
            </View>
          )}

          <VideoClipUploadModal
            visible={uploadVisible}
            matches={allMatches}
            currentPlayerId={id}
            onSubmit={async (data, uri) => {
              await addVideoClip(data, uri)
              setUploadVisible(false)
            }}
            onClose={() => setUploadVisible(false)}
          />

          <RNModal visible={playbackUrl !== null} animationType="fade" onRequestClose={() => setPlaybackUrl(null)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
              <Pressable
                onPress={() => setPlaybackUrl(null)}
                style={{ padding: Spacing.md }}
                accessibilityRole="button"
                accessibilityLabel="Cerrar reproductor">
                <MaterialIcons name="close" size={28} color="#fff" />
              </Pressable>
              {playbackUrl && <VideoView player={clipPlayer} style={{ flex: 1 }} nativeControls />}
            </SafeAreaView>
          </RNModal>

          <View style={styles.bottomPad} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

function SectionTitle({ title }: { title: string }) {
  const { colors } = useAppTheme()
  return (
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title.toUpperCase()}</ThemedText>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  screen: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  /* Hero */
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  playerName: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    letterSpacing: -0.3,
    color: '#fff',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  position: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.75)',
  },
  skillPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    gap: 2,
  },
  skillPillLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  skillPillText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.black,
    letterSpacing: 0.2,
  },

  /* Section title */
  sectionTitle: {
    fontFamily: Fonts.blackItalic,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  /* Generic card */
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  matchesCard: {
    padding: 0,
    overflow: 'hidden',
  },

  /* Empty state */
  emptyCard: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.xxxl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },

  /* Error / retry */
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  retryText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },

  bottomPad: { height: 16 },

  editBtn: {
    padding: 6,
    marginRight: 4,
  },

  /* Clips */
  clipFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  clipFilterChip: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  uploadClipBtn: {
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  uploadClipBtnText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
  },
  clipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
})
