import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export function useIsAdmin(): boolean {
  const { isAdmin } = useFirebaseAuth()
  return isAdmin
}
