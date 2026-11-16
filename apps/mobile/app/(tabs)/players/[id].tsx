import { useLocalSearchParams, useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { getGoalkeeping } from '@fulbito/utils'

import { StreakBadge } from '@/components/players/streak-badge'
import { InactiveBadge } from '@/components/players/inactive-badge'
import { PlayerStatsGrid } from '@/components/players/detail/player-stats-grid'
import { RecentMatchRow } from '@/components/players/detail/recent-match-row'
import { PlayerClipsSection } from '@/components/players/detail/player-clips-section'
import { PlayerGoldCard } from '@/components/players/detail/player-gold-card'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useMyPlayerId, useTournaments } from '@/contexts/TournamentContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { usePlayerDetail } from '@/hooks/use-player-detail'
import { useAppTheme } from '@/hooks/use-theme'
import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'
import { PrimaryGradient } from '@/components/primary-gradient'

const RECENT_MAX = 10

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const canManage = useCanManageTournament()
  const myPlayerId = useMyPlayerId()
  const { activeTournament } = useTournaments()
  const { colors, isDark, shadows } = useAppTheme()

  const {
    player,
    stats,
    streak,
    catSkills,
    overallAvg,
    matches: allMatches,
    loading,
    refreshing,
    error,
    refresh,
    reload,
    deletePlayer,
  } = usePlayerDetail(id)

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={[]}>
        <ActivityIndicator color={colors.primaryText} size="large" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={[]}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable onPress={() => void reload()} style={styles.retryBtn}>
          <PrimaryGradient />
          <ThemedText style={styles.retryText}>Reintentar</ThemedText>
        </Pressable>
      </SafeAreaView>
    )
  }

  if (!player) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={[]}>
        <ThemedText style={styles.errorText}>Jugador no encontrado.</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.retryBtn}>
          <PrimaryGradient />
          <ThemedText style={styles.retryText}>Volver</ThemedText>
        </Pressable>
      </SafeAreaView>
    )
  }

  const recentSlice = stats.recent.slice(0, RECENT_MAX)

  const confirmDelete = () => {
    Alert.alert('Confirmar eliminación', `¿Estás seguro de que querés eliminar a ${player.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlayer(player.id)
            router.back()
          } catch (e) {
            Alert.alert('No se pudo eliminar', e instanceof Error ? e.message : 'Intentá de nuevo más tarde.')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
      <ThemedView style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primaryText} />
          }
        >
          <View style={styles.cardArea}>
            <PlayerGoldCard
            name={player.name}
            position={player.position}
            overall={overallAvg}
            skills={catSkills}
            goalkeeping={getGoalkeeping(player)}
            photoUrl={player.photoUrl}
              tournamentPhotoUrl={activeTournament?.tournament.photoUrl}
            />
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/players'))}
              style={[styles.iconBtn, styles.backBtn, { backgroundColor: colors.primarySoft }]}
              accessibilityRole="button"
              accessibilityLabel="Volver a jugadores"
            >
              <MaterialIcons name="arrow-back" size={20} color={colors.primaryText} />
            </Pressable>
            {canManage && (
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => router.push(`/(tabs)/players/edit/${id}`)}
                  style={[styles.iconBtn, { backgroundColor: colors.primarySoft }]}
                  accessibilityRole="button"
                  accessibilityLabel="Editar jugador"
                >
                  <MaterialIcons name="edit" size={20} color={colors.primaryText} />
                </Pressable>
                <Pressable
                  onPress={confirmDelete}
                  style={[styles.iconBtn, { backgroundColor: colors.dangerBg }]}
                  accessibilityRole="button"
                  accessibilityLabel="Eliminar jugador"
                  accessibilityHint="Pide confirmación antes de eliminar"
                >
                  <MaterialIcons name="delete" size={20} color={isDark ? colors.dangerIcon : colors.danger} />
                </Pressable>
              </View>
            )}
          </View>

          <SectionTitle
            title="Estadísticas"
            right={
              <>
                {streak.kind ? <StreakBadge kind={streak.kind} count={streak.count} /> : null}
                <InactiveBadge inactive={player.inactive} />
              </>
            }
          />
          <View style={styles.statsWrap}>
            <PlayerStatsGrid stats={stats} />
          </View>

          {recentSlice.length > 0 ? (
            <>
              <SectionTitle title={`Últimos partidos (${stats.matches})`} />
              <View
                style={[
                  styles.card,
                  styles.matchesCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  shadows.card(isDark),
                ]}
              >
                {recentSlice.map((m, i) => (
                  <RecentMatchRow key={m.id} match={m} showBorder={i < recentSlice.length - 1} />
                ))}
              </View>
            </>
          ) : (
            <>
              <SectionTitle title="Últimos partidos" />
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialIcons name="sports-soccer" size={32} color={colors.muted} />
                <ThemedText style={[styles.emptyText, { color: colors.muted }]}>Sin partidos registrados</ThemedText>
              </View>
            </>
          )}

          <SectionTitle title="Clips" />
          <View style={styles.clipsWrap}>
            <PlayerClipsSection playerId={id} matches={allMatches} canUpload={canManage || myPlayerId === id} />
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  const { colors } = useAppTheme()
  const style = [styles.sectionTitle, right ? styles.sectionTitleInline : null, { color: colors.text }]
  const text = <ThemedText style={style}>{title.toUpperCase()}</ThemedText>
  if (!right) return text
  return (
    <View style={styles.sectionHeader}>
      {text}
      <View style={styles.sectionRight}>{right}</View>
    </View>
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
  sectionTitle: {
    fontFamily: Fonts.blackItalic,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
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
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryBtn: {
    overflow: 'hidden',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  retryText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },

  clipsWrap: {
    marginBottom: Spacing.xl,
  },
  bottomPad: { height: 16 },

  statsWrap: {
    marginBottom: Spacing.xl,
  },
  cardArea: {
    paddingTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  cardActions: {
    position: 'absolute',
    top: Spacing.lg,
    right: 0,
    gap: Spacing.sm,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitleInline: {
    marginTop: 0,
    marginBottom: 0,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
})
