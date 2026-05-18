import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useLayoutEffect } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { PlayerAvatar } from '@/components/players/player-avatar'
import { SkillBadge } from '@/components/players/skill-badge'
import { StreakBadge } from '@/components/players/streak-badge'
import { PlayerSkillBars } from '@/components/players/detail/player-skill-bars'
import { PlayerStatsGrid } from '@/components/players/detail/player-stats-grid'
import { RecentMatchRow } from '@/components/players/detail/recent-match-row'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { usePlayerDetail } from '@/hooks/use-player-detail'
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
            <PlayerSkillBars skills={catSkills} />
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
})
