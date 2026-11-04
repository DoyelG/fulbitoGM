import { canManageTournamentData, isTournamentAdminRole } from '@fulbito/utils'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'

export function useCanManageTournament(): boolean {
  const { isAdmin } = useFirebaseAuth()
  const role = useTournaments().activeTournament?.membership.role
  return canManageTournamentData(role, isAdmin)
}

export function useCanManageTournamentMembers(): boolean {
  return isTournamentAdminRole(useTournaments().activeTournament?.membership.role)
}
