import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Alert, View, Text, StyleSheet, ScrollView } from 'react-native'
import { deleteMatch } from '@fulbito/firebase'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { MyMatchEntry } from '@fulbito/types'
import {
  buildPersonalHistory,
  findPersonalTournament,
  isPersonalTournament,
  pickLatestFinalMatches,
  pickNextMatch,
  pickStreakLeaders,
  toLocalDay,
} from '@fulbito/utils'
import { Spacing, Radii, Fonts } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import { useMatchesData } from '@/hooks/use-matches-data'
import { HomeHero } from '@/components/home/home-hero'
import { HomeMenuGrid } from '@/components/home/home-menu-grid'
import { HomeMatchCard } from '@/components/home/home-match-card'
import { HomeLastMatchCard } from '@/components/home/home-last-match-card'
import { HomeNextMatchCard } from '@/components/home/home-next-match-card'
import { HomeRankingRow } from '@/components/home/home-ranking-row'
import { PersonalStatsGrid } from '@/components/personal/personal-stats-grid'
import { PlayerClipsSection } from '@/components/players/detail/player-clips-section'
import { WorldCupGoalCard } from '@/components/personal/world-cup-goal-card'
import { MyPlayerSection } from '@/components/personal/my-player-section'
import { PersonalMatchesList } from '@/components/personal/personal-matches-list'
import { ProfileButton } from '@/components/profile/profile-button'
import { StatSelectFilter } from '@/components/statistics/stat-select-filter'
import { useTournaments } from '@/contexts/TournamentContext'
import { useMyMatchEntries } from '@/hooks/use-my-match-entries'
import { useMyVideoClips } from '@/hooks/use-my-video-clips'

const MATCHES_PAGE_SIZE = 5
const RECENT_MATCHES_LIMIT = 3
const RANKING_LIMIT = 3

export default function HomeScreen() {
  const { colors: C, isDark, shadows } = useAppTheme()
  const { matches, players, loading, error } = useMatchesData()
  const router = useRouter()
  const { myTournaments, activeTournament, setActiveTournament } = useTournaments()
  const personal = findPersonalTournament(myTournaments)
  const isPersonalActive = isPersonalTournament(activeTournament?.tournament)
  const matchEntries = useMyMatchEntries(isPersonalActive)
  const [year, setYear] = useState<number | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(MATCHES_PAGE_SIZE)
  const today = toLocalDay(new Date())
  const nextMatch = useMemo(() => pickNextMatch(matches, today), [matches, today])
  const [latestMatch, ...recentMatches] = useMemo(
    () => pickLatestFinalMatches(matches, RECENT_MATCHES_LIMIT + 1),
    [matches],
  )
  const leaders = useMemo(
    () => pickStreakLeaders(players, matches, { winLimit: RANKING_LIMIT, lossLimit: 0 }).winning,
    [players, matches],
  )
  const showMatches = loading || Boolean(error) || recentMatches.length > 0
  const showRanking = !isPersonalActive && (loading || leaders.length > 0)
  const personalPlayerId = personal?.membership.playerId ?? null
  const otherClips = useMyVideoClips(isPersonalActive)
  const externalMatches = useMemo(() => matchEntries.entries.map(({ match }) => match), [matchEntries.entries])
  const { run, years, summary, sortedEntries } = useMemo(
    () => buildPersonalHistory(matchEntries.entries, year),
    [matchEntries.entries, year],
  )
  const tournamentNames = useMemo(
    () => new Map(myTournaments.map(({ tournament }) => [tournament.id, tournament.name])),
    [myTournaments],
  )
  const yearOptions = useMemo(
    () => [{ value: 'all', label: 'Todos' }, ...years.map((value) => ({ value: String(value), label: String(value) }))],
    [years],
  )
  const confirmDelete = ({ match }: MyMatchEntry) => {
    if (match.tournamentId !== personal?.tournament.id) return
    Alert.alert('Eliminar partido', 'Vas a eliminar este partido de tu historia. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMatch(match.tournamentId, match.id)
            matchEntries.removeMatch(match.id)
          } catch {
            Alert.alert('No se pudo eliminar', 'Intentá de nuevo.')
          }
        },
      },
    ])
  }
  const openMatch = ({ match }: MyMatchEntry) => {
    if (match.tournamentId !== activeTournament?.tournament.id) setActiveTournament(match.tournamentId)
    router.push({ pathname: '/(tabs)/history/[id]', params: { id: match.id } })
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.background }]} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <HomeHero />
        <HomeMenuGrid />

        {personal && isPersonalActive && personalPlayerId && (
          <HomeSection title="MI JUGADOR" color={C.text}>
            <MyPlayerSection playerId={personalPlayerId} />
          </HomeSection>
        )}

        {personal && isPersonalActive && (
          <HomeSection>
            <WorldCupGoalCard
              personal={personal}
              run={matchEntries.loading ? null : run}
              loading={matchEntries.loading}
              runError={matchEntries.error}
              onRetry={matchEntries.reload}
            />
          </HomeSection>
        )}

        {personal && isPersonalActive && personalPlayerId && (
          <HomeSection title="MIS ESTADÍSTICAS" color={C.text}>
            {years.length > 0 && (
              <View style={[styles.yearFilter, { backgroundColor: C.chipBg }]}>
                <StatSelectFilter
                  label="Año"
                  value={String(year)}
                  options={yearOptions}
                  onChange={(value) => {
                    setYear(value === 'all' ? 'all' : Number(value))
                    setVisibleCount(MATCHES_PAGE_SIZE)
                  }}
                />
              </View>
            )}
            {matchEntries.loading && (
              <ActivityIndicator accessibilityLabel="Cargando tus partidos" color={C.primaryText} />
            )}
            {!matchEntries.loading && !matchEntries.error && <PersonalStatsGrid summary={summary} />}
            {matchEntries.error && (
              <Text style={[styles.message, { color: C.muted }]}>No pudimos cargar tus partidos.</Text>
            )}
          </HomeSection>
        )}

        {!isPersonalActive && !error && (
          <HomeSection title="PRÓXIMO PARTIDO" color={C.text}>
            {loading ? (
              <ActivityIndicator accessibilityLabel="Cargando el próximo partido" color={C.primaryText} />
            ) : (
              <HomeNextMatchCard match={nextMatch} />
            )}
          </HomeSection>
        )}

        {isPersonalActive && personal && !matchEntries.loading && !matchEntries.error && (
          <HomeSection title="ÚLTIMOS PARTIDOS" color={C.text}>
            <PersonalMatchesList
              entries={sortedEntries.slice(0, visibleCount)}
              personalTournamentId={personal.tournament.id}
              tournamentNames={tournamentNames}
              onOpen={openMatch}
              onDelete={confirmDelete}
            />
            {sortedEntries.length > visibleCount && (
              <ProfileButton
                label="Ver más partidos"
                variant="secondary"
                onPress={() => setVisibleCount((count) => count + MATCHES_PAGE_SIZE)}
              />
            )}
          </HomeSection>
        )}

        {!isPersonalActive && latestMatch && (
          <HomeSection>
            <HomeLastMatchCard match={latestMatch} players={players} matches={matches} />
          </HomeSection>
        )}

        {!isPersonalActive && showMatches && (
          <HomeSection title="ÚLTIMOS PARTIDOS" color={C.text}>
            <View style={styles.matchList} accessibilityLiveRegion="polite">
              {loading && <ActivityIndicator accessibilityLabel="Cargando partidos" color={C.primaryText} />}
              {!loading && error && (
                <Text style={[styles.message, { color: C.muted }]}>No pudimos cargar los partidos.</Text>
              )}
              {recentMatches.map((m) => (
                <HomeMatchCard key={m.id} match={m} accentColor={C.secondary} />
              ))}
            </View>
          </HomeSection>
        )}

        {showRanking && (
          <HomeSection title="MUNDIALITO" color={C.text}>
            <View
              accessibilityLiveRegion="polite"
              style={[styles.rankingCard, { backgroundColor: C.surface }, shadows.card(isDark) as object]}
            >
              {loading && (
                <ActivityIndicator
                  accessibilityLabel="Cargando ranking"
                  color={C.primaryText}
                  style={styles.rankingMessage}
                />
              )}
              {leaders.map((l, i) => (
                <HomeRankingRow key={l.playerId} leader={l} pos={i + 1} showBorder={i < leaders.length - 1} />
              ))}
            </View>
          </HomeSection>
        )}

        {personal && isPersonalActive && personalPlayerId && (
          <View style={styles.clips}>
            <PlayerClipsSection
              playerId={personalPlayerId}
              matches={matches}
              canUpload
              extraClips={otherClips}
              extraMatches={externalMatches}
            />
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  )
}

function HomeSection({ title, color, children }: { title?: string; color?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      {title && (
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color }]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 32 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.lg },
  clips: { paddingHorizontal: Spacing.lg },
  yearFilter: { borderRadius: Radii.md },

  sectionTitle: {
    fontFamily: Fonts.blackItalic,
    fontSize: 18,
    letterSpacing: 0.5,
  },

  matchList: { gap: Spacing.md },

  rankingCard: {
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
