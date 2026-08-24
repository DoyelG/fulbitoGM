import { Redirect } from 'expo-router'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export default function IndexScreen() {
  const { user, loading } = useFirebaseAuth()

  if (loading) return null

  return <Redirect href={user ? '/(tabs)/home' : '/login'} />
}
