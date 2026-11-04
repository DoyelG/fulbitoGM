'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import Loading from '@/app/loading'
import Button from '@/components/Button'

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
  const loadMyTournaments = useTournamentStore((state) => state.loadMyTournaments)
  const isGated = Boolean(user) && needsActiveTournament(pathname)
  const isLoaded = myTournamentsInit === 'loaded' && myTournamentsUid === user?.uid
  const shouldRedirect = isGated && isLoaded && !activeTournament

  useEffect(() => {
    if (shouldRedirect) router.replace('/tournaments')
  }, [shouldRedirect, router])

  if (isGated && user && myTournamentsInit === 'error') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div role="alert" className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <p>No se pudieron cargar tus torneos.</p>
          <Button type="button" variant="secondary" className="mt-3" onClick={() => loadMyTournaments(user.uid)}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }
  if (isGated && (!isLoaded || shouldRedirect)) return <Loading />
  return <>{children}</>
}
