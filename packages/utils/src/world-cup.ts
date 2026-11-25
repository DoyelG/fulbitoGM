import { MAX_WORLD_CUP_GOAL, type MyMatchEntry } from '@fulbito/types'
import { compareEntriesChronological, getEntryResult, isOfficialEntry } from './match-entry'

export type UnbeatenRun = { current: number; best: number }

export type WorldCupProgress = { current: number; goal: number; percent: number; reached: boolean }

export function calculateUnbeatenRun(entries: MyMatchEntry[]): UnbeatenRun {
  const chronological = entries.filter(isOfficialEntry).sort(compareEntriesChronological)

  let current = 0
  let best = 0

  for (const entry of chronological) {
    if (getEntryResult(entry) === 'loss') {
      current = 0
      continue
    }
    current++
    best = Math.max(best, current)
  }

  return { current, best }
}

export function worldCupProgress(run: Pick<UnbeatenRun, 'current'>, goal: number): WorldCupProgress {
  const safeGoal = Math.max(1, Math.floor(goal))
  const percent = Math.min(100, Math.round((run.current / safeGoal) * 100))
  return { current: run.current, goal: safeGoal, percent, reached: run.current >= safeGoal }
}

export function isValidWorldCupGoal(goal: number): boolean {
  return Number.isInteger(goal) && goal >= 1 && goal <= MAX_WORLD_CUP_GOAL
}
