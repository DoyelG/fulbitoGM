'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournamentStore, type TournamentInput } from '@/store/useTournamentStore'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import TournamentCard from '@/components/tournaments/TournamentCard'
import TournamentForm from '@/components/tournaments/TournamentForm'

function TournamentsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-hidden>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-32 rounded-xl bg-gray-200 animate-pulse" />
      ))}
    </div>
  )
}

export default function TournamentsClient() {
  const { user, loading: authLoading } = useFirebaseAuth()
  const { myTournaments, myTournamentsInit, myTournamentsUid, loadMyTournaments, addTournament } = useTournamentStore()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (user && (myTournamentsInit === 'idle' || myTournamentsUid !== user.uid)) loadMyTournaments(user.uid)
  }, [user, myTournamentsInit, myTournamentsUid, loadMyTournaments])

  const handleCreate = async (data: TournamentInput) => {
    if (!user) return
    await addTournament(data, user)
    setCreateOpen(false)
  }

  const isLoading =
    authLoading ||
    (Boolean(user) &&
      (myTournamentsInit === 'idle' || myTournamentsInit === 'loading' || myTournamentsUid !== user?.uid))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Mis torneos</h1>
        {user && (
          <Button type="button" onClick={() => setCreateOpen(true)} className="items-center gap-2">
            <PlusIcon className="h-5 w-5" aria-hidden />
            Crear torneo
          </Button>
        )}
      </div>

      <section aria-label="Lista de torneos" aria-busy={isLoading} aria-live="polite">
        {isLoading && <TournamentsSkeleton />}

        {!isLoading && !user && (
          <EmptyState
            icon={UserCircleIcon}
            title="Iniciá sesión para ver tus torneos"
            description="Tus torneos y las invitaciones que recibas aparecen acá."
            action={{ label: 'Entrar', href: '/login' }}
          />
        )}

        {!isLoading && user && myTournamentsInit === 'error' && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>No se pudieron cargar tus torneos.</p>
            <Button type="button" variant="secondary" className="mt-3" onClick={() => loadMyTournaments(user.uid)}>
              Reintentar
            </Button>
          </div>
        )}

        {!isLoading && user && myTournamentsInit === 'loaded' && myTournaments.length === 0 && (
          <EmptyState
            icon={TrophyIcon}
            title="Todavía no tenés torneos"
            description="Creá un torneo para organizar a tus jugadores, partidos y estadísticas, o esperá a que te inviten a uno."
            action={{ label: 'Crear torneo', onClick: () => setCreateOpen(true) }}
          />
        )}

        {!isLoading && user && myTournamentsInit === 'loaded' && myTournaments.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myTournaments.map((item) => (
              <li key={item.tournament.id}>
                <TournamentCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Crear torneo">
        <TournamentForm onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
      </Modal>
    </div>
  )
}
