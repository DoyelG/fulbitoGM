import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'

export function useCanManageTournament(): boolean {
  const { isAdmin } = useFirebaseAuth()
  const role = useTournaments().activeTournament?.membership.role
  return isAdmin || role === 'OWNER' || role === 'ADMIN'
}
