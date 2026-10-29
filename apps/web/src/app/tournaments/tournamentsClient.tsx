'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import type { MyTournament } from '@fulbito/types'
import { useTournamentStore, type TournamentInput } from '@/store/useTournamentStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import TournamentCard from '@/components/tournaments/TournamentCard'
import TournamentForm from '@/components/tournaments/TournamentForm'
import TournamentConfirmDialog from '@/components/tournaments/TournamentConfirmDialog'

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
  const {
    myTournaments,
    myTournamentsInit,
    myTournamentsUid,
    activeTournamentId,
    loadMyTournaments,
    addTournament,
    editTournament,
    removeTournament,
    exitTournament,
    setActiveTournament,
  } = useTournamentStore()
  const players = usePlayerStore((state) => state.players)
  const initPlayers = usePlayerStore((state) => state.initLoad)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<MyTournament | null>(null)
  const [deleting, setDeleting] = useState<MyTournament | null>(null)
  const [leaving, setLeaving] = useState<MyTournament | null>(null)

  useEffect(() => {
    if (user && (myTournamentsInit === 'idle' || myTournamentsUid !== user.uid)) loadMyTournaments(user.uid)
  }, [user, myTournamentsInit, myTournamentsUid, loadMyTournaments])

  const hasLinkedPlayer = myTournaments.some(({ membership }) => membership.playerId)
  useEffect(() => {
    if (hasLinkedPlayer) initPlayers()
  }, [hasLinkedPlayer, initPlayers])

  const playerName = (playerId: string | null) =>
    playerId ? (players.find((player) => player.id === playerId)?.name ?? null) : null

  const handleCreate = async (data: TournamentInput) => {
    if (!user) return
    await addTournament(data, user)
    setCreateOpen(false)
  }

  const handleEdit = async (data: TournamentInput) => {
    if (!editing) return
    await editTournament(editing.tournament.id, data)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!deleting) return
    await removeTournament(deleting.tournament.id)
    setDeleting(null)
  }

  const handleLeave = async () => {
    if (!leaving) return
    await exitTournament(leaving.tournament.id)
    setLeaving(null)
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
                <TournamentCard
                  item={item}
                  active={item.tournament.id === activeTournamentId}
                  onActivate={setActiveTournament}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                  onLeave={setLeaving}
                  playerName={playerName(item.membership.playerId)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Crear torneo">
        <TournamentForm
          submitLabel="Crear torneo"
          submittingLabel="Creando..."
          errorMessage="No se pudo crear el torneo. Intentá de nuevo."
          onCancel={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar torneo">
        {editing && (
          <TournamentForm
            key={editing.tournament.id}
            initial={{ name: editing.tournament.name, description: editing.tournament.description }}
            initialPhotoUrl={editing.tournament.photoUrl}
            submitLabel="Guardar cambios"
            submittingLabel="Guardando..."
            errorMessage="No se pudo guardar el torneo. Intentá de nuevo."
            onCancel={() => setEditing(null)}
            onSubmit={handleEdit}
          />
        )}
      </Modal>

      <TournamentConfirmDialog
        open={deleting !== null}
        title="Eliminar torneo"
        message={
          <>
            ¿Seguro que querés eliminar <span className="font-semibold">{deleting?.tournament.name}</span>? Nadie va a
            poder verlo ni editarlo, incluido vos.
          </>
        }
        confirmLabel="Eliminar"
        confirmingLabel="Eliminando..."
        errorMessage="No se pudo eliminar el torneo. Intentá de nuevo."
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <TournamentConfirmDialog
        open={leaving !== null}
        title="Abandonar torneo"
        message={
          <>
            ¿Seguro que querés abandonar <span className="font-semibold">{leaving?.tournament.name}</span>? Vas a dejar
            de verlo y para volver te tienen que invitar de nuevo.
          </>
        }
        confirmLabel="Abandonar"
        confirmingLabel="Abandonando..."
        errorMessage="No se pudo abandonar el torneo. Intentá de nuevo."
        onCancel={() => setLeaving(null)}
        onConfirm={handleLeave}
      />
    </div>
  )
}
