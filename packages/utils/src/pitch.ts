import type { MatchPlayer, PitchPosition } from '@fulbito/types'

export type PitchSide = 'A' | 'B'

export const PITCH_GOALKEEPER_X = 7
const LINE_Y_MIN = 12
const LINE_Y_MAX = 88
const PITCH_X_BOUNDS = { min: 3, max: 97 }
const PITCH_Y_BOUNDS = { min: 6, max: 94 }

const THREE_LINES_X = [19, 31, 43]

type Spot = [x: number, y: number]

const FORMATIONS_BY_OUTFIELD_COUNT: Record<number, Spot[]> = {
  4: [
    [23, 50],
    [33, 18],
    [33, 82],
    [42, 50],
  ],
  5: [
    [21, 19],
    [21, 81],
    [35, 50],
    [41, 16],
    [41, 84],
  ],
  6: [
    [19, 26],
    [19, 74],
    [31, 50],
    [35, 14],
    [35, 86],
    [43, 50],
  ],
  7: [
    [19, 50],
    [23, 18],
    [23, 82],
    [31, 50],
    [37, 22],
    [37, 78],
    [44, 50],
  ],
  8: [
    [18, 50],
    [21, 22],
    [21, 78],
    [32, 35],
    [32, 65],
    [39, 11],
    [39, 89],
    [44, 50],
  ],
  9: [
    [18, 30],
    [18, 70],
    [27, 8],
    [27, 92],
    [32, 36],
    [32, 64],
    [42, 10],
    [42, 90],
    [44, 50],
  ],
  10: [
    [18, 30],
    [18, 70],
    [27, 8],
    [27, 92],
    [29, 50],
    [38, 28],
    [38, 72],
    [42, 7],
    [42, 93],
    [44, 50],
  ],
}

const ROLE_DEPTH: Record<string, number> = { GK: 0, DEF: 0, MID: 1, PLAYER: 1, FWD: 2 }
const UNKNOWN_ROLE_DEPTH = 1

function evenLineSpots(outfield: number): Spot[] {
  const base = Math.floor(outfield / 3)
  const extra = outfield % 3
  return [0, 1, 2].flatMap((line) => {
    const count = base + (line < extra ? 1 : 0)
    return lineYs(count).map((y): Spot => [THREE_LINES_X[line], y])
  })
}

function lineYs(count: number): number[] {
  if (count === 0) return []
  if (count === 1) return [50]
  return Array.from({ length: count }, (_, index) => LINE_Y_MIN + (index * (LINE_Y_MAX - LINE_Y_MIN)) / (count - 1))
}

function mirror(position: PitchPosition, side: PitchSide): PitchPosition {
  return side === 'A' ? position : { x: 100 - position.x, y: position.y }
}

function roleDepth(role: string | undefined): number {
  return role !== undefined && role in ROLE_DEPTH ? ROLE_DEPTH[role] : UNKNOWN_ROLE_DEPTH
}

function pickGoalkeeper(
  playerIds: string[],
  goalkeeperIds: readonly string[],
  roleById: Readonly<Record<string, string | undefined>>,
): string | undefined {
  return (
    playerIds.find((id) => goalkeeperIds.includes(id)) ??
    playerIds.find((id) => roleById[id] === 'GK') ??
    [...playerIds].reverse().find((id) => roleById[id] === 'DEF') ??
    playerIds[playerIds.length - 1]
  )
}

export function defaultTeamFormation(
  playerIds: string[],
  goalkeeperIds: readonly string[],
  side: PitchSide,
  roleById: Readonly<Record<string, string | undefined>> = {},
): Record<string, PitchPosition> {
  const goalkeeperId = pickGoalkeeper(playerIds, goalkeeperIds, roleById)
  const outfield = playerIds
    .filter((id) => id !== goalkeeperId)
    .map((id, order) => ({ id, order, depth: roleDepth(roleById[id]) }))
    .sort((a, b) => a.depth - b.depth || a.order - b.order)
  const spots = [...(FORMATIONS_BY_OUTFIELD_COUNT[outfield.length] ?? evenLineSpots(outfield.length))].sort(
    (a, b) => a[0] - b[0] || a[1] - b[1],
  )
  const formation: Record<string, PitchPosition> = {}

  if (goalkeeperId) formation[goalkeeperId] = mirror({ x: PITCH_GOALKEEPER_X, y: 50 }, side)
  outfield.forEach(({ id }, index) => {
    const [x, y] = spots[index]
    formation[id] = mirror({ x, y }, side)
  })
  return formation
}

export function clampPitchPosition(position: PitchPosition): PitchPosition {
  return {
    x: Math.min(PITCH_X_BOUNDS.max, Math.max(PITCH_X_BOUNDS.min, position.x)),
    y: Math.min(PITCH_Y_BOUNDS.max, Math.max(PITCH_Y_BOUNDS.min, position.y)),
  }
}

function isPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

export function hasPitchPosition(player: Pick<MatchPlayer, 'x' | 'y'>): player is { x: number; y: number } {
  return isPercent(player.x) && isPercent(player.y)
}

export function resolveTeamPositions(
  team: Pick<MatchPlayer, 'id' | 'x' | 'y'>[],
  goalkeeperIds: readonly string[],
  side: PitchSide,
  roleById: Readonly<Record<string, string | undefined>> = {},
): Record<string, PitchPosition> {
  const fallback = defaultTeamFormation(
    team.map((player) => player.id),
    goalkeeperIds,
    side,
    roleById,
  )
  return Object.fromEntries(
    team.map((player) => [player.id, hasPitchPosition(player) ? { x: player.x, y: player.y } : fallback[player.id]]),
  )
}

export function withPitchPositions<T extends { id: string }>(
  team: T[],
  positions: Record<string, PitchPosition>,
): (T & Partial<PitchPosition>)[] {
  return team.map((player) => {
    const position = positions[player.id]
    return position ? { ...player, x: round(position.x), y: round(position.y) } : player
  })
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

const SNAP_RADIUS = 7
const SPOT_TAKEN_RADIUS = 2

function distance(a: PitchPosition, b: PitchPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export type PitchMove = { id: string; position: PitchPosition }

export type PitchDrop = { id: string; position: PitchPosition; origin: PitchPosition }

function nearestWithin<T>(items: T[], at: (item: T) => PitchPosition, target: PitchPosition) {
  return items
    .map((item) => ({ item, gap: distance(at(item), target) }))
    .filter(({ gap }) => gap <= SNAP_RADIUS)
    .sort((a, b) => a.gap - b.gap)[0]
}

export function resolvePitchDrop(
  drop: PitchDrop,
  spots: readonly PitchPosition[],
  teammates: Readonly<Record<string, PitchPosition>>,
  opponents: readonly PitchPosition[],
): PitchMove[] {
  const mates = Object.entries(teammates).filter(([id]) => id !== drop.id)
  const taken = [...mates.map(([, position]) => position), ...opponents]
  const freeSpots = spots.filter((spot) => !taken.some((other) => distance(other, spot) < SPOT_TAKEN_RADIUS))
  const mate = nearestWithin(mates, ([, position]) => position, drop.position)
  const spot = nearestWithin(freeSpots, (position) => position, drop.position)

  if (mate && (!spot || mate.gap <= spot.gap)) {
    const [mateId, matePosition] = mate.item
    return [
      { id: drop.id, position: matePosition },
      { id: mateId, position: drop.origin },
    ]
  }
  return spot ? [{ id: drop.id, position: spot.item }] : []
}
