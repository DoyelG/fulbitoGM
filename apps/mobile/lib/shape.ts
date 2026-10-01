import type { Player } from '@fulbito/types'

type RawPlayer = {
  id: string
  name: string
  position: string
  skill: number | null
  skills?: unknown
  photoUrl?: string | null
  goalkeeping?: number
  createdAt: Date | string
  updatedAt: Date | string
  inactive?: boolean
}

export function shapeStorePlayers(players: RawPlayer[]): Player[] {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    position: player.position,
    skill: player.skill ?? null,
    skills: player.skills as Player['skills'],
    inactive: player.inactive ?? false,
    photoUrl: player.photoUrl ?? undefined,
    goalkeeping: player.goalkeeping ?? undefined,
    createdAt: player.createdAt instanceof Date ? player.createdAt : new Date(player.createdAt),
    updatedAt: player.updatedAt instanceof Date ? player.updatedAt : new Date(player.updatedAt),
  }))
}
