import type { Match, Player } from '@fulbito/types'
import { balanceRemainingPlayers, getGoalkeeping } from '@fulbito/utils'
import { useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { AutoGenerateButton } from './matchForm/autoGenerateButton'
import { DateField } from './matchForm/dateField'
import { FormActions } from './matchForm/formActions'
import { GoalkeeperSection } from './matchForm/goalkeeperSection'
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
  const MAX_GOALKEEPERS = 2
  const [goalkeeperIds, setGoalkeeperIds] = useState<Set<string>>(
    () => new Set(initial?.goalkeeperIds ?? []),
  )

  // ── State hooks ─────────────────────────────────────────────────────────────
  const pool = usePool(players, initial)
  const teams = useTeams(initial)
  const scores = useScores(initial)
  const shirts = useShirts(players, allMatches, teams.teamA, teams.teamB, initial)

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
    setGoalkeeperIds((prev) => new Set([...prev].filter((id) => ids.has(id))))
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

  const handleTypeChange = (t: MatchType) => {
    setMatchType(t)
    teams.reset()
  }

  const generateRemainingTeams = () => {
    const toInfo = (p: Player) => {
      const info = toPlayerInfo(p)
      return goalkeeperIds.has(p.id) ? { ...info, skill: getGoalkeeping(p) } : info
    }
    const normSkill = (s: number | 'unknown') => (s === 'unknown' ? 5 : s)
    const pinnedIds = new Set([...teams.pinnedA, ...teams.pinnedB])

    const seedA = pool.poolPlayers.filter((p) => teams.pinnedA.has(p.id)).map(toInfo)
    const seedB = pool.poolPlayers.filter((p) => teams.pinnedB.has(p.id)).map(toInfo)

    const unpinnedKeepers = pool.poolPlayers
      .filter((p) => goalkeeperIds.has(p.id) && !pinnedIds.has(p.id))
      .map(toInfo)
      .sort((a, b) => normSkill(b.skill) - normSkill(a.skill))
    const keeperSeededIds = new Set<string>()
    for (const k of unpinnedKeepers) {
      if (seedA.length <= seedB.length) seedA.push(k)
      else seedB.push(k)
      keeperSeededIds.add(k.id)
    }

    const unassigned = pool.poolPlayers
      .filter((p) => !pinnedIds.has(p.id) && !keeperSeededIds.has(p.id))
      .map(toInfo)
      .sort(() => Math.random() - 0.5)
    const result = balanceRemainingPlayers(unassigned, seedA, seedB, playersPerTeam)
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
        goalkeeperIds: [...goalkeeperIds],
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
