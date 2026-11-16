import { useTournamentStore } from './useTournamentStore'

export function getActiveTournamentId(): string {
  const tournamentId = useTournamentStore.getState().activeTournamentId
  if (!tournamentId) throw new Error('No active tournament')
  return tournamentId
}

export function isStillActive(tournamentId: string): boolean {
  return useTournamentStore.getState().activeTournamentId === tournamentId
}
