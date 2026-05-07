import type { Match } from '@fulbito/types'

import { getBackendUrl } from '@/lib/config'

export async function addMatchRequest(m: Omit<Match, 'id'>): Promise<void> {
  const base = getBackendUrl()
  const res = await fetch(`${base}/api/matches`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(m),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Error al guardar partido (${res.status})`)
  }
}

export async function updateMatchRequest(id: string, m: Omit<Match, 'id'>): Promise<void> {
  const base = getBackendUrl()
  const res = await fetch(`${base}/api/matches/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(m),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Error al actualizar partido (${res.status})`)
  }
}

export async function deleteMatchRequest(id: string): Promise<void> {
  const base = getBackendUrl()
  const res = await fetch(`${base}/api/matches/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Error al eliminar partido (${res.status})`)
  }
}
