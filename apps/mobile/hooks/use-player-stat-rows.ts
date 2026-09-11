import type { Match, Player } from '@fulbito/types'
import { computePlayerStatRows, type PlayerStatRow } from '@fulbito/utils'
import { useMemo } from 'react'

export type { PlayerStatRow }

export function usePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[] {
  return useMemo(() => computePlayerStatRows(players, matches), [players, matches])
}
