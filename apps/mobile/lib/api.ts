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
