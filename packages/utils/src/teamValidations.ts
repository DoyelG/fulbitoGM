import type { PlayerInfo } from '@fulbito/types'

// Real position tags used by both apps' position pickers; 'PLAYER' ("cualquier posición") is a
// no-preference sentinel and intentionally excluded so untagged pools don't skew the balance.
const POSITION_BUCKETS = ['GK', 'DEF', 'MID', 'FWD'] as const

export function computePositionImbalance(teamA: PlayerInfo[], teamB: PlayerInfo[]): number {
  const count = (team: PlayerInfo[], bucket: string) => team.filter(p => p.position === bucket).length
  return POSITION_BUCKETS.reduce((sum, bucket) => sum + Math.abs(count(teamA, bucket) - count(teamB, bucket)), 0)
}

export function sumMvpCount(playerIds: string[], mvpCounts: Map<string, number>): number {
  return playerIds.reduce((sum, id) => sum + (mvpCounts.get(id) ?? 0), 0)
}
