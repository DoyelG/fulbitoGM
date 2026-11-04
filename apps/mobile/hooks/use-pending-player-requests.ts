import { getPendingTournamentPlayerRequests } from '@fulbito/firebase'
import type { TournamentPlayerRequest } from '@fulbito/types'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import { useActiveTournamentId } from '@/contexts/TournamentContext'
import { useCanManageTournamentMembers } from '@/hooks/use-can-manage-tournament'

const POLLING_INTERVAL_IN_MS = 30_000

type SharedRequests = { tournamentId: string | null; requests: TournamentPlayerRequest[] }

export type PendingPlayerRequestsState = {
  requests: TournamentPlayerRequest[]
  error: string | null
  reload: () => Promise<void>
}

let sharedRequests: SharedRequests = { tournamentId: null, requests: [] }
const listeners = new Set<() => void>()
const pollers = new Map<string, { subscribers: number; intervalId: ReturnType<typeof setInterval> }>()

function setSharedRequests(next: SharedRequests) {
  sharedRequests = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function loadSharedRequests(tournamentId: string) {
  const requests = await getPendingTournamentPlayerRequests(tournamentId)
  setSharedRequests({ tournamentId, requests })
}

function startPolling(tournamentId: string): () => void {
  const poller = pollers.get(tournamentId)
  if (poller) {
    poller.subscribers += 1
  } else {
    loadSharedRequests(tournamentId).catch(() => undefined)
    const intervalId = setInterval(
      () => loadSharedRequests(tournamentId).catch(() => undefined),
      POLLING_INTERVAL_IN_MS,
    )
    pollers.set(tournamentId, { subscribers: 1, intervalId })
  }

  return () => {
    const current = pollers.get(tournamentId)
    if (!current) return
    current.subscribers -= 1
    if (current.subscribers > 0) return
    clearInterval(current.intervalId)
    pollers.delete(tournamentId)
  }
}

export function usePendingPlayerRequests(): PendingPlayerRequestsState {
  const tournamentId = useActiveTournamentId()
  const canManage = useCanManageTournamentMembers()
  const shared = useSyncExternalStore(subscribe, () => sharedRequests)
  const [error, setError] = useState<string | null>(null)
  const isEnabled = canManage && tournamentId !== null

  const reload = useCallback(async () => {
    if (!tournamentId) return
    setError(null)
    try {
      await loadSharedRequests(tournamentId)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error al cargar las solicitudes')
    }
  }, [tournamentId])

  useEffect(() => {
    if (!isEnabled || !tournamentId) return
    return startPolling(tournamentId)
  }, [isEnabled, tournamentId])

  const requests = isEnabled && shared.tournamentId === tournamentId ? shared.requests : []
  return { requests, error, reload }
}
