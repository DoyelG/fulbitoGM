import { canManageTournamentData } from '@fulbito/utils'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'

export function useCanManageTournament(): boolean {
  const { isAdmin } = useFirebaseAuth()
  const role = useTournamentStore(selectActiveTournament)?.membership.role
  return canManageTournamentData(role, isAdmin)
}
