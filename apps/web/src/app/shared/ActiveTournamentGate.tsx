'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import Loading from '@/app/loading'

const ROUTES_WITHOUT_TOURNAMENT = ['/login', '/tournaments', '/profile']

function needsActiveTournament(pathname: string): boolean {
  return !ROUTES_WITHOUT_TOURNAMENT.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export default function ActiveTournamentGate({ children }: { children: React.ReactNode }) {
  const { user } = useFirebaseAuth()
  const pathname = usePathname()
  const router = useRouter()
  const myTournamentsInit = useTournamentStore((state) => state.myTournamentsInit)
  const myTournamentsUid = useTournamentStore((state) => state.myTournamentsUid)
  const activeTournament = useTournamentStore(selectActiveTournament)
  const isGated = Boolean(user) && needsActiveTournament(pathname)
  const isLoaded = myTournamentsInit === 'loaded' && myTournamentsUid === user?.uid
  const shouldRedirect = isGated && isLoaded && !activeTournament

  useEffect(() => {
    if (shouldRedirect) router.replace('/tournaments')
  }, [shouldRedirect, router])

  if (isGated && myTournamentsInit !== 'error' && (!isLoaded || shouldRedirect)) return <Loading />
  return <>{children}</>
}
