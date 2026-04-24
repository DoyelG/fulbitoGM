import type { Player } from '@fulbito/types'

export function shapeStorePlayers(
  players: Array<{
    id: string
    name: string
    position: string
    skill: number | null
    skills?: unknown
    photoUrl?: string | null
    createdAt: Date | string
    updatedAt: Date | string
  }>,
): Player[] {
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    skill: p.skill ?? null,
    skills: p.skills as Player['skills'],
    photoUrl: p.photoUrl ?? undefined,
    shirtDutiesCount: (p as { shirtDutiesCount?: number }).shirtDutiesCount ?? 0,
    createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt),
  }))
}
