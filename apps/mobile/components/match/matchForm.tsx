import type { Match, Player } from '@fulbito/types'
import { balanceRemainingPlayers } from '@fulbito/utils'
import { useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { AutoGenerateButton } from './matchForm/autoGenerateButton'
import { DateField } from './matchForm/dateField'
import { FormActions } from './matchForm/formActions'
import { buildMatchPayload, computeTeamStats, toPlayerInfo } from './matchForm/helpers'
import { NameField } from './matchForm/nameField'
import { PoolSection } from './matchForm/poolSection'
import { ShirtsSection } from './matchForm/shirtsSection'
import { TeamAssignmentSection } from './matchForm/teamAssignmentSection'
import { TeamScoreSection } from './matchForm/teamScoreSection'
import type { MatchType } from './matchForm/types'
import { TypeSelector } from './matchForm/typeSelector'
import { usePool } from './matchForm/usePool'
import { useScores } from './matchForm/useScores'
import { pickShirtsResponsible, useShirts } from './matchForm/useShirts'
import { useTeams } from './matchForm/useTeams'

export type MatchFormProps = {
  mode: 'create' | 'edit'
  initial?: Match
  players: Player[]
  allMatches: Match[]
  saving: boolean
  onSave: (m: Omit<Match, 'id'>) => Promise<void>
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

  // ── Basic info ──────────────────────────────────────────────────────────────
  const [matchDate, setMatchDate] = useState<string>(
    initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  )
  const [matchType, setMatchType] = useState<MatchType>((initial?.type as MatchType) ?? '5v5')
  const [matchName, setMatchName] = useState(initial?.name ?? '')
  const playersPerTeam = useMemo(() => parseInt(matchType.split('v')[0], 10), [matchType])

  // ── State hooks ─────────────────────────────────────────────────────────────
  const pool = usePool(players, initial)
  const teams = useTeams(initial)
  const scores = useScores(initial)
  const shirts = useShirts(allMatches, teams.teamA, teams.teamB, initial)

  // ── Derived ─────────────────────────────────────────────────────────────────
  const teamStats = useMemo(
    () => computeTeamStats(teams.teamA, teams.teamB, pool.poolPlayers),
    [teams.teamA, teams.teamB, pool.poolPlayers],
  )

  const scoreA = parseInt(scores.teamAScore) || 0
  const scoreB = parseInt(scores.teamBScore) || 0
  const canSave =
    teams.teamA.length === playersPerTeam &&
    teams.teamB.length === playersPerTeam &&
    scores.teamAScore !== '' &&
    scores.teamBScore !== '' &&
    scoreA === scores.totalGoalsA &&
    scoreB === scores.totalGoalsB

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePoolChange = (ids: Set<string>) => {
    pool.setPoolIds(ids)
    teams.filterByPool(ids)
  }

  const handleTypeChange = (t: MatchType) => {
    setMatchType(t)
    teams.reset()
  }

  const generateRemainingTeams = () => {
    const pinnedAPlayers = pool.poolPlayers.filter((p) => teams.pinnedA.has(p.id)).map(toPlayerInfo)
    const pinnedBPlayers = pool.poolPlayers.filter((p) => teams.pinnedB.has(p.id)).map(toPlayerInfo)
    const pinnedIds = new Set([...teams.pinnedA, ...teams.pinnedB])
    const unassigned = pool.poolPlayers
      .filter((p) => !pinnedIds.has(p.id))
      .map(toPlayerInfo)
      .sort(() => Math.random() - 0.5)
    const result = balanceRemainingPlayers(
      unassigned,
      pinnedAPlayers,
      pinnedBPlayers,
      playersPerTeam,
    )
    teams.setTeamA(result.teamA.players.map((p) => ({ id: p.id, name: p.name })))
    teams.setTeamB(result.teamB.players.map((p) => ({ id: p.id, name: p.name })))
  }

  const handleSave = async () => {
    if (!canSave) return
    try {
      const payload = buildMatchPayload({
        matchDate,
        matchType,
        matchName,
        teamA: teams.teamA,
        teamB: teams.teamB,
        teamAScore: scoreA,
        teamBScore: scoreB,
        goalsA: scores.goalsA,
        goalsB: scores.goalsB,
        perfA: scores.perfA,
        perfB: scores.perfB,
        shirtsResponsibleId: pickShirtsResponsible(shirts.shirtsResponsibleId, shirts.dutyPoolIds),
      })
      await onSave(payload)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { padding: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      <NameField
        value={matchName}
        onChange={(v) => {
          setMatchName(v)
          onTitleChange?.(v)
        }}
      />

      <DateField value={matchDate} onChange={setMatchDate} />

      <TypeSelector value={matchType} onChange={handleTypeChange} />

      <PoolSection
        players={players}
        poolPlayers={pool.poolPlayers}
        poolIds={pool.poolIds}
        maxSize={playersPerTeam * 2}
        onConfirm={handlePoolChange}
      />

      <TeamAssignmentSection
        playersPerTeam={playersPerTeam}
        poolPlayers={pool.poolPlayers}
        teamA={teams.teamA}
        teamB={teams.teamB}
        pinnedA={teams.pinnedA}
        pinnedB={teams.pinnedB}
        stats={teamStats}
        onConfirmTeam={teams.confirmTeam}
        onRemoveFromTeam={teams.removeFromTeam}
      />

      {mode === 'create' ? (
        <AutoGenerateButton
          poolSize={pool.poolIds.size}
          playersPerTeam={playersPerTeam}
          onPress={generateRemainingTeams}
        />
      ) : null}

      <View style={styles.scoresRow}>
        <TeamScoreSection
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
        onCancel={onCancel}
        onSave={() => void handleSave()}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
})
