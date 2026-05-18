import type { Match, Player } from '@fulbito/types'

import { getBackendUrl } from '@/lib/config'
import { shapeStorePlayers } from '@/lib/shape'

export async function loadPlayersAndMatches(): Promise<{
  players: Player[]
  matches: Match[]
}> {
  const base = getBackendUrl()
  const [playersRes, matchesRes] = await Promise.all([
    fetch(`${base}/api/players`),
    fetch(`${base}/api/matches`),
  ])

  if (!playersRes.ok) {
    throw new Error(`No se pudieron cargar jugadores (${playersRes.status})`)
  }
  if (!matchesRes.ok) {
    throw new Error(`No se pudieron cargar partidos (${matchesRes.status})`)
  }

  const rawPlayers = await playersRes.json()
  const matches: Match[] = await matchesRes.json()

  return {
    players: shapeStorePlayers(rawPlayers),
    matches,
  }
}

export type PlayerPayload = {
  name: string
  position: string
  skills: {
    physical: number
    technical: number
    tactical: number
    psychological: number
  }
  skill: number
}

export async function updatePlayerRequest(id: string, payload: PlayerPayload): Promise<void> {
  const base = getBackendUrl()
  const res = await fetch(`${base}/api/players/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Error al actualizar jugador (${res.status})`)
  }
}

export async function deletePlayerRequest(id: string): Promise<void> {
  const base = getBackendUrl()
  const res = await fetch(`${base}/api/players/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Error al eliminar (${res.status})`)
  }
}
