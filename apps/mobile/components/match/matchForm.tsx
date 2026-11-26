import type { Match, MatchInput, MatchLocation, MatchType, Player } from '@fulbito/types'
import {
  balanceRemainingPlayers,
  calculateAllCurrentStreaks,
  getGoalkeeping,
  getHotStreakIds,
  onlyFinalMatches,
  parseMatchDate,
  resolveTeamPositions,
  seedPriorityPlayers,
  withPitchPositions,
} from '@fulbito/utils'
import { useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { useAppTheme } from '@/hooks/use-theme'
import { AutoGenerateButton } from './matchForm/autoGenerateButton'
import { DateField } from './matchForm/dateField'
import { DescriptionField } from './matchForm/descriptionField'
import { FormActions } from './matchForm/formActions'
import { GoalkeeperSection } from './matchForm/goalkeeperSection'
import { HourField } from './matchForm/hourField'
import { buildDraftMatchPayload, buildFinalMatchPayload, computeTeamStats, toPlayerInfo } from './matchForm/helpers'
import { MvpSection } from './matchForm/mvpSection'
import { NameField } from './matchForm/nameField'
import { PoolSection } from './matchForm/poolSection'
import { ShirtsSection } from './matchForm/shirtsSection'
import { TeamAssignmentSection } from './matchForm/teamAssignmentSection'
import { TeamScoreSection } from './matchForm/teamScoreSection'
import { ToggleFriendlyMatch } from './matchForm/toggleFriendlyMatch'
import { TypeSelector } from './matchForm/typeSelector'
import { usePool } from './matchForm/usePool'
import { useScores } from './matchForm/useScores'
import { pickShirtsResponsible, useShirts } from './matchForm/useShirts'
import { useTeams } from './matchForm/useTeams'
import { usePitchPositions } from './matchForm/usePitchPositions'
import { PitchEditorSection } from './matchForm/pitchEditorSection'
import { LocationField } from './matchForm/locationField'

export type MatchFormProps = {
  mode: 'create' | 'edit'
  initial?: Match
  players: Player[]
  allMatches: Match[]
  saving: boolean
  onSave: (match: MatchInput) => Promise<void>
  onCancel: () => void
  onTitleChange?: (title: string) => void
}

export function MatchForm({
  mode,
  initial,
  players,
  allMatches,
  saving,
  onSave,
  onCancel,
  onTitleChange,
}: MatchFormProps) {
  const { colors, spacing } = useAppTheme()
  const canManage = useCanManageTournament()

  const [matchDate, setMatchDate] = useState<string>(
    initial ? parseMatchDate(initial).date : new Date().toISOString().slice(0, 10),
  )
  const [matchHour, setMatchHour] = useState<number | null>(initial ? parseMatchDate(initial).hour : null)
  const [matchLocation, setMatchLocation] = useState<MatchLocation | null>(initial?.location ?? null)
  const [matchDescription, setMatchDescription] = useState<string>(initial?.description ?? '')
  const [matchType, setMatchType] = useState<MatchType>((initial?.type as MatchType) ?? '5v5')
  const [matchName, setMatchName] = useState(initial?.name ?? '')
  const playersPerTeam = useMemo(() => parseInt(matchType.split('v')[0], 10), [matchType])
  const MAX_GOALKEEPERS = 2
  const [goalkeeperIds, setGoalkeeperIds] = useState<Set<string>>(() => new Set(initial?.goalkeeperIds ?? []))
  const [mvpId, setMvpId] = useState<string | null>(initial?.mvpId ?? null)
  const [isMatchFriendly, setIsMatchFriendly] = useState<boolean>(initial?.isFriendly ?? false)

  const pool = usePool(players, initial)
  const teams = useTeams(initial)
  const scores = useScores(initial)
  const shirts = useShirts(allMatches, teams.teamA, teams.teamB, initial)
  const pitch = usePitchPositions(initial)
  const [isDraggingOnPitch, setIsDraggingOnPitch] = useState(false)
  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])

  const teamStats = useMemo(
    () => computeTeamStats(teams.teamA, teams.teamB, pool.poolPlayers),
    [teams.teamA, teams.teamB, pool.poolPlayers],
  )

  const scoreA = parseInt(scores.teamAScore) || 0
  const scoreB = parseInt(scores.teamBScore) || 0
  const isCreating = mode === 'create'
  const teamsComplete = teams.teamA.length === playersPerTeam && teams.teamB.length === playersPerTeam
  const canSave =
    teamsComplete &&
    (isCreating ||
      (scores.teamAScore !== '' &&
        scores.teamBScore !== '' &&
        scoreA === scores.totalGoalsA &&
        scoreB === scores.totalGoalsB))

  useEffect(() => {
    const mvpStillInTeams = !mvpId || [...teams.teamA, ...teams.teamB].some((player) => player.id === mvpId)
    if (!mvpStillInTeams) setMvpId(null)
  }, [teams.teamA, teams.teamB, mvpId])

  const handlePoolChange = (ids: Set<string>) => {
    pool.setPoolIds(ids)
    teams.filterByPool(ids)
    setGoalkeeperIds((prev) => new Set([...prev].filter((playerId) => ids.has(playerId))))
  }

  const toggleGoalkeeper = (id: string) => {
    setGoalkeeperIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= MAX_GOALKEEPERS) return prev
        next.add(id)
      }
      return next
    })
  }

  const handleTypeChange = (type: MatchType) => {
    setMatchType(type)
    teams.reset()
  }

  const generateRemainingTeams = () => {
    const toInfo = (player: Player) => {
      const info = toPlayerInfo(player)
      return goalkeeperIds.has(player.id) ? { ...info, skill: getGoalkeeping(player) } : info
    }

    const poolInfos = pool.poolPlayers.map(toInfo)
    const pinnedSeedA = poolInfos.filter((player) => teams.pinnedA.has(player.id))
    const pinnedSeedB = poolInfos.filter((player) => teams.pinnedB.has(player.id))
    const streaks = calculateAllCurrentStreaks(onlyFinalMatches(allMatches))

    const { seedA, seedB, rest } = seedPriorityPlayers(poolInfos, playersPerTeam, {
      goalkeeperIds,
      streaks,
      initialSeedA: pinnedSeedA,
      initialSeedB: pinnedSeedB,
    })

    const hardLockedIds = new Set([...pinnedSeedA, ...pinnedSeedB].map((player) => player.id))
    const hotStreakIds = getHotStreakIds(poolInfos, streaks)
    const shuffledRest = [...rest].sort(() => Math.random() - 0.5)
    const result = balanceRemainingPlayers(shuffledRest, seedA, seedB, playersPerTeam, {
      hardLockedIds,
      goalkeeperIds,
      hotStreakIds,
    })
    teams.setTeamA(result.teamA.players.map((player) => ({ id: player.id, name: player.name })))
    teams.setTeamB(result.teamB.players.map((player) => ({ id: player.id, name: player.name })))
  }

  const positionsToSave = () => {
    const placed = pitch.positionsFor(teams.teamA, teams.teamB)
    if (!isCreating) return placed
    const gkIds = [...goalkeeperIds]
    return {
      ...resolveTeamPositions(withPitchPositions(teams.teamA, placed), gkIds, 'A', roleById),
      ...resolveTeamPositions(withPitchPositions(teams.teamB, placed), gkIds, 'B', roleById),
    }
  }

  const handleSave = async () => {
    if (!canSave) return
    try {
      const base = {
        matchDate,
        matchHour,
        matchType,
        matchName,
        matchDescription,
        teamA: teams.teamA,
        teamB: teams.teamB,
        shirtsResponsibleId: pickShirtsResponsible(shirts.shirtsResponsibleId, shirts.dutyPoolIds),
        goalkeeperIds: [...goalkeeperIds],
        isMatchFriendly,
        matchLocation,
        positions: positionsToSave(),
      }
      const payload = isCreating
        ? buildDraftMatchPayload(base)
        : buildFinalMatchPayload({
            ...base,
            teamAScore: scoreA,
            teamBScore: scoreB,
            goalsA: scores.goalsA,
            goalsB: scores.goalsB,
            perfA: scores.perfA,
            perfB: scores.perfB,
            mvpId,
          })
      await onSave(payload)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.container, { padding: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!isDraggingOnPitch}
    >
      <NameField
        value={matchName}
        onChange={(name) => {
          setMatchName(name)
          onTitleChange?.(name)
        }}
      />

      <DateField value={matchDate} onChange={setMatchDate} />

      <HourField value={matchHour} onChange={setMatchHour} />

      <LocationField value={matchLocation} onChange={setMatchLocation} />

      <DescriptionField value={matchDescription} onChange={setMatchDescription} />

      <ToggleFriendlyMatch isMatchFriendly={isMatchFriendly} setIsMatchFriendly={setIsMatchFriendly} />

      <TypeSelector value={matchType} onChange={handleTypeChange} />

      <PoolSection
        players={players}
        poolPlayers={pool.poolPlayers}
        poolIds={pool.poolIds}
        maxSize={playersPerTeam * 2}
        onConfirm={handlePoolChange}
      />

      <GoalkeeperSection
        poolPlayers={pool.poolPlayers}
        goalkeeperIds={goalkeeperIds}
        maxSize={MAX_GOALKEEPERS}
        onToggle={toggleGoalkeeper}
      />

      <TeamAssignmentSection
        playersPerTeam={playersPerTeam}
        poolPlayers={pool.poolPlayers}
        teamA={teams.teamA}
        teamB={teams.teamB}
        pinnedA={teams.pinnedA}
        pinnedB={teams.pinnedB}
        goalkeeperIds={goalkeeperIds}
        stats={teamStats}
        onConfirmTeam={teams.confirmTeam}
        onRemoveFromTeam={teams.removeFromTeam}
      />

      {isCreating ? (
        <AutoGenerateButton
          poolSize={pool.poolIds.size}
          playersPerTeam={playersPerTeam}
          hasTeams={teams.teamA.length > 0 || teams.teamB.length > 0}
          onPress={generateRemainingTeams}
        />
      ) : null}

      {isCreating && teamsComplete ? (
        <PitchEditorSection
          teamA={teams.teamA}
          teamB={teams.teamB}
          positions={pitch.positionsFor(teams.teamA, teams.teamB)}
          goalkeeperIds={[...goalkeeperIds]}
          players={players}
          onPlayerMove={pitch.move}
          onDraggingChange={setIsDraggingOnPitch}
        />
      ) : null}

      {isCreating ? null : (
        <>
          <View style={styles.scoresRow}>
            <TeamScoreSection
              side="a"
              label="Equipo A"
              players={teams.teamA}
              score={scores.teamAScore}
              total={scores.totalGoalsA}
              goals={scores.goalsA}
              perf={scores.perfA}
              onScoreChange={scores.setTeamAScore}
              onGoalChange={scores.setGoalA}
              onPerfChange={scores.setPerfA}
            />
            <TeamScoreSection
              side="b"
              label="Equipo B"
              players={teams.teamB}
              score={scores.teamBScore}
              total={scores.totalGoalsB}
              goals={scores.goalsB}
              perf={scores.perfB}
              onScoreChange={scores.setTeamBScore}
              onGoalChange={scores.setGoalB}
              onPerfChange={scores.setPerfB}
            />
          </View>

          <MvpSection
            teamA={teams.teamA}
            teamB={teams.teamB}
            mvpId={mvpId}
            onChange={setMvpId}
            goalsA={scores.goalsA}
            goalsB={scores.goalsB}
            perfA={scores.perfA}
            perfB={scores.perfB}
          />
        </>
      )}

      <ShirtsSection
        players={players}
        shirtsResponsibleId={shirts.shirtsResponsibleId}
        onChange={shirts.setShirtsResponsibleId}
        teamPlayers={shirts.teamPlayers}
        playedBefore={shirts.playedBefore}
        dutiesById={shirts.dutiesById}
      />

      <FormActions
        mode={mode}
        saving={saving}
        canSave={canSave}
        showSave={mode === 'edit' || canManage}
        onCancel={onCancel}
        onSave={() => void handleSave()}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
})
