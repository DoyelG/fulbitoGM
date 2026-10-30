'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import Loading from '@/app/loading'

const PUBLIC_ROUTES = ['/login']

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const shouldRedirect = !loading && (user ? isPublicRoute : !isPublicRoute)

  useEffect(() => {
    if (shouldRedirect) router.replace(user ? '/' : '/login')
  }, [shouldRedirect, user, router])

  if (loading || shouldRedirect) return <Loading />
  return <>{children}</>
}
