'use client'

import { useEffect, useMemo, useState } from 'react'
import { isOpen, type Match, type MatchType } from '@fulbito/types'
import {
  adminAddSignup,
  adminRemoveSignup,
  changeOpenMatchType,
  joinOpenMatch,
  leaveOpenMatch,
  OpenMatchError,
  subscribeToMatch,
} from '@fulbito/firebase'
import { getOpenMatchState, type OpenMatchState } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { selectMyPlayerId, useTournamentStore } from '@/store/useTournamentStore'

const CLOCK_TICK_MS = 60_000

type LiveScalars = Omit<Match, 'teamA' | 'teamB'>

export function useLiveMatch(match: Match | null): Match | null {
  const [live, setLive] = useState<LiveScalars | null>(null)
  const matchId = match?.id ?? null
  const watch = match !== null && isOpen(match)

  useEffect(() => {
    if (!matchId || !watch) return
    return subscribeToMatch(matchId, setLive)
  }, [matchId, watch])

  return useMemo(() => {
    if (!match || !live || live.id !== match.id) return match
    return { ...match, ...live }
  }, [match, live])
}

type WatchedMatch = { id: string; match: LiveScalars | null }

export function useMatchById(matchId: string | null): Match | null {
  const [watched, setWatched] = useState<WatchedMatch | null>(null)

  useEffect(() => {
    if (!matchId) return
    return subscribeToMatch(matchId, (match) => setWatched({ id: matchId, match }))
  }, [matchId])

  return useMemo(() => {
    if (!watched?.match || watched.id !== matchId) return null
    return { ...watched.match, teamA: [], teamB: [] }
  }, [watched, matchId])
}

function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), CLOCK_TICK_MS)
    return () => clearInterval(intervalId)
  }, [])
  return now
}

export type OpenMatchController = {
  match: Match | null
  state: OpenMatchState | null
  myPlayerId: string | null
  pending: boolean
  error: string | null
  join: () => Promise<void>
  leave: () => Promise<void>
  addPlayer: (playerId: string) => Promise<void>
  removePlayer: (playerId: string) => Promise<void>
  changeType: (type: MatchType) => Promise<void>
}

export function useOpenMatch(source: Match | null): OpenMatchController {
  const match = useLiveMatch(source)
  const myPlayerId = useTournamentStore(selectMyPlayerId)
  const now = useNow()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const state = useMemo(
    () => (match && isOpen(match) ? getOpenMatchState(match, myPlayerId, now) : null),
    [match, myPlayerId, now],
  )

  const run = async (action: (matchId: string) => Promise<void>) => {
    if (!match || pending) return
    setPending(true)
    setError(null)
    try {
      await action(match.id)
      await useMatchStore.getState().resetAndReload()
    } catch (caught) {
      setError(caught instanceof OpenMatchError ? caught.message : 'No se pudo actualizar la lista. Probá de nuevo.')
    } finally {
      setPending(false)
    }
  }

  return {
    match,
    state,
    myPlayerId,
    pending,
    error,
    join: () => run((matchId) => (myPlayerId ? joinOpenMatch(matchId, myPlayerId) : Promise.resolve())),
    leave: () => run((matchId) => (myPlayerId ? leaveOpenMatch(matchId, myPlayerId) : Promise.resolve())),
    addPlayer: (playerId) => run((matchId) => adminAddSignup(matchId, playerId)),
    removePlayer: (playerId) => run((matchId) => adminRemoveSignup(matchId, playerId)),
    changeType: (type) => run((matchId) => changeOpenMatchType(matchId, type)),
  }
}
