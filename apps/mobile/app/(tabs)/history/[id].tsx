import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { teamTotals, winProbabilityA, isTournamentAdminRole } from '@fulbito/utils'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MatchHero } from '@/components/match-detail/match-hero'
import { MatchHighlightsCard } from '@/components/match-detail/match-highlights-card'
import { MatchInfoCard } from '@/components/match-detail/match-info-card'
import { MatchTeamCard, type TeamResult } from '@/components/match-detail/match-team-card'
import { TournamentCommentsCard } from '@/components/match-detail/tournament-comments-card'
import { styles } from '@/components/match-detail/match-detail-screen.styles'
import { PlayerClipsSection } from '@/components/players/detail/player-clips-section'
import { PrimaryGradient } from '@/components/primary-gradient'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMyPlayerId, useTournaments } from '@/contexts/TournamentContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { useMatchesData } from '@/hooks/use-matches-data'
import { useTournamentComments } from '@/hooks/use-tournament-comments'
import { useTournamentMembers } from '@/hooks/use-tournament-members'
import { useAppTheme } from '@/hooks/use-theme'

function teamResult(own: number, rival: number): TeamResult {
  if (own === rival) return 'draw'
  return own > rival ? 'win' : 'loss'
}

function SectionTitle({ title }: { title: string }) {
  const { colors } = useAppTheme()
  return (
    <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
      {title.toUpperCase()}
    </Text>
  )
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors } = useAppTheme()
  const { user } = useFirebaseAuth()
  const { activeTournament } = useTournaments()
  const myPlayerId = useMyPlayerId()
  const canManage = useCanManageTournament()
  const { matches, players, loading, error, refreshing, refresh, reload } = useMatchesData()
  const tournamentId = activeTournament?.tournament.id ?? null
  const comments = useTournamentComments(tournamentId)
  const members = useTournamentMembers(tournamentId)

  const match = matches.find((row) => row.id === id) ?? null
  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])
  const photoByUid = useMemo(() => {
    const photos = new Map<string, string>()
    for (const member of members) {
      const photoUrl = member.playerId ? playerById.get(member.playerId)?.photoUrl : null
      if (photoUrl) photos.set(member.uid, photoUrl)
    }
    return photos
  }, [members, playerById])

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/history'))

  if (!match) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered, { backgroundColor: colors.background }]} edges={[]}>
        {loading ? (
          <ActivityIndicator color={colors.primaryText} accessibilityLabel="Cargando partido" />
        ) : (
          <>
            <Text style={[styles.message, { color: colors.text }]}>
              {error ? 'No se pudo cargar el partido.' : 'No encontramos este partido.'}
            </Text>
            <Pressable
              onPress={error ? () => void reload() : goBack}
              style={styles.retryBtn}
              accessibilityRole="button"
            >
              <PrimaryGradient />
              <Text style={styles.retryText}>{error ? 'Reintentar' : 'Volver'}</Text>
            </Pressable>
          </>
        )}
      </SafeAreaView>
    )
  }

  const isDraft = match.status === 'draft'
  const goalkeeperIds = new Set(match.goalkeeperIds ?? [])
  const totalsA = teamTotals(match.teamA, playerById)
  const totalsB = teamTotals(match.teamB, playerById)
  const probabilityA = winProbabilityA(totalsA, totalsB)
  const isParticipant = [...match.teamA, ...match.teamB].some((player) => player.id === myPlayerId)
  const shared = { isDraft, goalkeeperIds, mvpId: match.mvpId ?? null }
  const membership = activeTournament?.membership
  const linkedName = membership?.playerId ? playerById.get(membership.playerId)?.name : undefined
  const authorName = linkedName || (user?.email ?? '').split('@')[0]

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primaryText} />
          }
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={goBack}
              style={[styles.iconBtn, { backgroundColor: colors.primarySoft }]}
              accessibilityRole="button"
              accessibilityLabel="Volver al historial"
            >
              <MaterialIcons name="arrow-back" size={20} color={colors.primaryText} />
            </Pressable>
            {canManage && (
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/history/edit/[id]', params: { id: match.id } })}
                style={[styles.actionBtn, isDraft ? null : styles.iconBtn]}
                accessibilityRole="button"
                accessibilityLabel={isDraft ? 'Completar resultado' : 'Editar partido'}
              >
                <PrimaryGradient />
                <MaterialIcons name={isDraft ? 'check-circle-outline' : 'edit'} size={20} color={colors.onPrimary} />
                {isDraft && <Text style={styles.actionText}>Completar resultado</Text>}
              </Pressable>
            )}
          </View>

          <MatchHero match={match} tournamentPhotoUrl={activeTournament?.tournament.photoUrl ?? null} />

          <SectionTitle title="Datos del partido" />
          <MatchInfoCard match={match} playerById={playerById} />

          <SectionTitle title="Equipos" />
          <View style={styles.teams}>
            <MatchTeamCard
              {...shared}
              title="Equipo A"
              players={match.teamA}
              result={isDraft ? null : teamResult(match.teamAScore, match.teamBScore)}
              totals={totalsA}
              winProbability={probabilityA}
              tone="primary"
            />
            <MatchTeamCard
              {...shared}
              title="Equipo B"
              players={match.teamB}
              result={isDraft ? null : teamResult(match.teamBScore, match.teamAScore)}
              totals={totalsB}
              winProbability={100 - probabilityA}
              tone="secondary"
            />
          </View>

          <SectionTitle title="Clips" />
          <PlayerClipsSection matchId={match.id} matches={matches} canUpload={canManage || isParticipant} />

          {!isDraft && (
            <>
              <SectionTitle title="Destacados" />
              <MatchHighlightsCard match={match} />
            </>
          )}

          {user && (
            <>
              <SectionTitle title="Comentarios" />
              <TournamentCommentsCard
                state={comments}
                photoByUid={photoByUid}
                canModerate={isTournamentAdminRole(membership?.role)}
                onSubmit={(text) => comments.addComment(text, { uid: user.uid, name: authorName })}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
