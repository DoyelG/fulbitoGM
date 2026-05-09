import type { AuthUser } from '@/lib/auth'
import { getStoredUser, logout } from '@/lib/auth'
import { useCallback, useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const u = await getStoredUser()
    setUser(u)
    return u
  }, [])

  useEffect(() => {
    void getStoredUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signOut = useCallback(async () => {
    await logout()
    setUser(null)
  }, [])

  return { user, loading, refresh, signOut }
}
