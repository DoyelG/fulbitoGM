import { getPendingTournamentPlayerRequests } from '@fulbito/firebase'
import type { TournamentPlayerRequest } from '@fulbito/types'
import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { useActiveTournamentId } from '@/contexts/TournamentContext'
import { useCanManageTournamentMembers } from '@/hooks/use-can-manage-tournament'

const POLLING_INTERVAL_IN_MS = 30_000
const LOAD_ERROR_MESSAGE = 'No se pudieron cargar las solicitudes. Probá de nuevo más tarde.'

type SharedRequests = { tournamentId: string | null; requests: TournamentPlayerRequest[]; error: string | null }

export type PendingPlayerRequestsState = {
  requests: TournamentPlayerRequest[]
  error: string | null
  reload: () => Promise<void>
}

let sharedRequests: SharedRequests = { tournamentId: null, requests: [], error: null }
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
  try {
    const requests = await getPendingTournamentPlayerRequests(tournamentId)
    setSharedRequests({ tournamentId, requests, error: null })
  } catch {
    const requests = sharedRequests.tournamentId === tournamentId ? sharedRequests.requests : []
    setSharedRequests({ tournamentId, requests, error: LOAD_ERROR_MESSAGE })
  }
}

function startPolling(tournamentId: string): () => void {
  const poller = pollers.get(tournamentId)
  if (poller) {
    poller.subscribers += 1
  } else {
    void loadSharedRequests(tournamentId)
    const intervalId = setInterval(() => void loadSharedRequests(tournamentId), POLLING_INTERVAL_IN_MS)
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
  const isEnabled = canManage && tournamentId !== null

  const reload = useCallback(async () => {
    if (tournamentId) await loadSharedRequests(tournamentId)
  }, [tournamentId])

  useEffect(() => {
    if (!isEnabled || !tournamentId) return
    return startPolling(tournamentId)
  }, [isEnabled, tournamentId])

  const isCurrent = isEnabled && shared.tournamentId === tournamentId
  return { requests: isCurrent ? shared.requests : [], error: isCurrent ? shared.error : null, reload }
}
