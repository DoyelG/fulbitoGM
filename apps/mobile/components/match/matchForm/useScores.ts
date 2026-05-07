import type { Match } from '@fulbito/types'
import { useMemo, useState } from 'react'

export type ScoresState = {
  teamAScore: string
  teamBScore: string
  goalsA: Record<string, string>
  goalsB: Record<string, string>
  perfA: Record<string, string>
  perfB: Record<string, string>
  totalGoalsA: number
  totalGoalsB: number
  setTeamAScore: (v: string) => void
  setTeamBScore: (v: string) => void
  setGoalA: (id: string, v: string) => void
  setGoalB: (id: string, v: string) => void
  setPerfA: (id: string, v: string) => void
  setPerfB: (id: string, v: string) => void
}

export function useScores(initial?: Match): ScoresState {
  const [teamAScore, setTeamAScore] = useState<string>(
    typeof initial?.teamAScore === 'number' ? String(initial.teamAScore) : '0',
  )
  const [teamBScore, setTeamBScore] = useState<string>(
    typeof initial?.teamBScore === 'number' ? String(initial.teamBScore) : '0',
  )
  const [goalsA, setGoalsA] = useState<Record<string, string>>(() =>
    Object.fromEntries((initial?.teamA ?? []).map((p) => [p.id, String(p.goals)])),
  )
  const [perfA, setPerfA] = useState<Record<string, string>>(() =>
    Object.fromEntries((initial?.teamA ?? []).map((p) => [p.id, String(p.performance)])),
  )
  const [goalsB, setGoalsB] = useState<Record<string, string>>(() =>
    Object.fromEntries((initial?.teamB ?? []).map((p) => [p.id, String(p.goals)])),
  )
  const [perfB, setPerfB] = useState<Record<string, string>>(() =>
    Object.fromEntries((initial?.teamB ?? []).map((p) => [p.id, String(p.performance)])),
  )

  const totalGoalsA = useMemo(
    () => Object.values(goalsA).reduce((s, n) => s + (parseInt(n) || 0), 0),
    [goalsA],
  )
  const totalGoalsB = useMemo(
    () => Object.values(goalsB).reduce((s, n) => s + (parseInt(n) || 0), 0),
    [goalsB],
  )

  return {
    teamAScore,
    teamBScore,
    goalsA,
    goalsB,
    perfA,
    perfB,
    totalGoalsA,
    totalGoalsB,
    setTeamAScore,
    setTeamBScore,
    setGoalA: (id, v) => setGoalsA((s) => ({ ...s, [id]: v })),
    setGoalB: (id, v) => setGoalsB((s) => ({ ...s, [id]: v })),
    setPerfA: (id, v) => setPerfA((s) => ({ ...s, [id]: v })),
    setPerfB: (id, v) => setPerfB((s) => ({ ...s, [id]: v })),
  }
}
