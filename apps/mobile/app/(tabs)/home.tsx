import { useMemo } from 'react'
import { ActivityIndicator, View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { pickLatestFinalMatches, pickStreakLeaders } from '@fulbito/utils'
import { Spacing, Radii, Fonts } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import { useMatchesData } from '@/hooks/use-matches-data'
import { HomeHero } from '@/components/home/home-hero'
import { HomeMenuGrid } from '@/components/home/home-menu-grid'
import { HomeMatchCard } from '@/components/home/home-match-card'
import { HomeRankingRow } from '@/components/home/home-ranking-row'

const LAST_MATCHES_LIMIT = 2
const RANKING_LIMIT = 3

export default function HomeScreen() {
  const { colors: C, isDark, shadows } = useAppTheme()
  const { matches, players, loading, error } = useMatchesData()
  const lastMatches = useMemo(() => pickLatestFinalMatches(matches, LAST_MATCHES_LIMIT), [matches])
  const leaders = useMemo(
    () => pickStreakLeaders(players, matches, { winLimit: RANKING_LIMIT, lossLimit: 0 }).winning,
    [players, matches],
  )

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.background }]} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <HomeHero />
        <HomeMenuGrid />

        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: C.text }]}>
          ÚLTIMOS PARTIDOS
        </Text>
        <View style={styles.matchList} accessibilityLiveRegion="polite">
          {loading && <ActivityIndicator accessibilityLabel="Cargando partidos" color={C.brand} />}
          {!loading && error && (
            <Text style={[styles.message, { color: C.muted }]}>No pudimos cargar los partidos.</Text>
          )}
          {!loading && !error && lastMatches.length === 0 && (
            <Text style={[styles.message, { color: C.muted }]}>Todavía no hay partidos.</Text>
          )}
          {lastMatches.map((m, i) => (
            <HomeMatchCard key={m.id} match={m} accentColor={i === 0 ? C.brand : C.secondary} />
          ))}
        </View>

        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: C.text }]}>
          MUNDIALITO
        </Text>
        <View
          accessibilityLiveRegion="polite"
          style={[styles.rankingCard, { backgroundColor: C.surface }, shadows.card(isDark) as object]}
        >
          {loading && (
            <ActivityIndicator accessibilityLabel="Cargando ranking" color={C.brand} style={styles.rankingMessage} />
          )}
          {!loading && !error && leaders.length === 0 && (
            <Text style={[styles.message, styles.rankingMessage, { color: C.muted }]}>Todavía no hay rachas.</Text>
          )}
          {leaders.map((l, i) => (
            <HomeRankingRow key={l.playerId} leader={l} pos={i + 1} showBorder={i < leaders.length - 1} />
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 32 },

  sectionTitle: {
    fontFamily: Fonts.blackItalic,
    fontSize: 18,
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },

  matchList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  rankingCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },

  message: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },

  rankingMessage: { padding: Spacing.lg },

  bottomPad: { height: 16 },
})
