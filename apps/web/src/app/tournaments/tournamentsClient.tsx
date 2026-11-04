'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import type { MyTournament } from '@fulbito/types'
import { getPlayersByIds } from '@fulbito/firebase'
import { useTournamentStore, type TournamentInput } from '@/store/useTournamentStore'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import TournamentCard from '@/components/tournaments/TournamentCard'
import TournamentForm from '@/components/tournaments/TournamentForm'
import TournamentConfirmDialog from '@/components/tournaments/TournamentConfirmDialog'
import PendingInvitations from '@/components/tournaments/PendingInvitations'
import VerifyEmailNotice from '@/components/tournaments/VerifyEmailNotice'
import LinkPlayerDialog from '@/components/tournaments/LinkPlayerDialog'
import AssignMyPlayerDialog from '@/components/tournaments/AssignMyPlayerDialog'

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
  const [playerNameById, setPlayerNameById] = useState<Map<string, string>>(new Map())
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<MyTournament | null>(null)
  const [deleting, setDeleting] = useState<MyTournament | null>(null)
  const [leaving, setLeaving] = useState<MyTournament | null>(null)
  const [linking, setLinking] = useState<MyTournament | null>(null)
  const [photoFailed, setPhotoFailed] = useState(false)

  const linkedPlayerIds = myTournaments.flatMap(({ membership }) => (membership.playerId ? [membership.playerId] : []))
  const linkedPlayerIdsKey = linkedPlayerIds.join(',')
  useEffect(() => {
    if (!linkedPlayerIdsKey) return
    let isCurrent = true
    getPlayersByIds(linkedPlayerIdsKey.split(',')).then((linkedPlayers) => {
      if (isCurrent) setPlayerNameById(new Map(linkedPlayers.map((player) => [player.id, player.name])))
    })
    return () => {
      isCurrent = false
    }
  }, [linkedPlayerIdsKey])

  const playerName = (playerId: string | null) => (playerId ? (playerNameById.get(playerId) ?? null) : null)

  const handleCreate = async (data: TournamentInput) => {
    if (!user) return
    const { photoSaved } = await addTournament(data, user)
    setPhotoFailed(!photoSaved)
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

  const handleLinkPlayer = (item: MyTournament) => {
    if (item.tournament.id !== activeTournamentId) setActiveTournament(item.tournament.id)
    setLinking(item)
  }

  const isLoading =
    authLoading ||
    (Boolean(user) &&
      (myTournamentsInit === 'idle' || myTournamentsInit === 'loading' || myTournamentsUid !== user?.uid))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Mis torneos</h1>
        {user?.emailVerified && (
          <Button type="button" onClick={() => setCreateOpen(true)} className="items-center gap-2">
            <PlusIcon className="h-5 w-5" aria-hidden />
            Crear torneo
          </Button>
        )}
      </div>

      {photoFailed && (
        <p role="status" className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          Creamos el torneo, pero no se pudo subir la imagen. Podés agregarla editándolo.
        </p>
      )}

      {user &&
        (user.emailVerified ? (
          <PendingInvitations key={user.uid} user={user} />
        ) : (
          <VerifyEmailNotice email={user.email} />
        ))}

      {(!user || user.emailVerified) && (
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
            <div role="alert" className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
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
                    onLinkPlayer={handleLinkPlayer}
                    playerName={playerName(item.membership.playerId)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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

      {user &&
        linking &&
        (linking.membership.role === 'MEMBER' ? (
          <LinkPlayerDialog
            key={linking.tournament.id}
            user={user}
            tournamentId={linking.tournament.id}
            onClose={() => setLinking(null)}
          />
        ) : (
          <AssignMyPlayerDialog key={linking.tournament.id} item={linking} onClose={() => setLinking(null)} />
        ))}
    </div>
  )
}
