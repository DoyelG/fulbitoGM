'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, PlusIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import type { InvitationRole, TournamentMember } from '@fulbito/types'
import { getAssignablePlayers } from '@fulbito/utils'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournamentStore } from '@/store/useTournamentStore'
import { useTournamentDetailStore, type InvitationInput } from '@/store/useTournamentDetailStore'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import TournamentConfirmDialog from '@/components/tournaments/TournamentConfirmDialog'
import MembersTable from '@/components/tournaments/members/MembersTable'
import AssignPlayerForm from '@/components/tournaments/members/AssignPlayerForm'
import ChangeRoleForm from '@/components/tournaments/members/ChangeRoleForm'
import InviteMemberForm from '@/components/tournaments/detail/InviteMemberForm'

function Container({ children }: { children: ReactNode }) {
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
}

export default function MembersClient({ tournamentId }: { tournamentId: string }) {
  const { user, loading: authLoading } = useFirebaseAuth()
  const { myTournaments, myTournamentsInit, myTournamentsUid, loadMyTournaments } = useTournamentStore()
  const detail = useTournamentDetailStore()
  const [assigning, setAssigning] = useState<TournamentMember | null>(null)
  const [changingRole, setChangingRole] = useState<TournamentMember | null>(null)
  const [removing, setRemoving] = useState<TournamentMember | null>(null)
  const [inviting, setInviting] = useState(false)
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null)

  useEffect(() => {
    if (user && (myTournamentsInit === 'idle' || myTournamentsUid !== user.uid)) loadMyTournaments(user.uid)
  }, [user, myTournamentsInit, myTournamentsUid, loadMyTournaments])

  const item = myTournaments.find(({ tournament }) => tournament.id === tournamentId) ?? null
  const isMember = item !== null
  const loadDetail = detail.load

  useEffect(() => {
    if (isMember) loadDetail(tournamentId)
  }, [isMember, tournamentId, loadDetail])

  const { players, members } = detail
  const playerNameById = useMemo(() => new Map(players.map((player) => [player.id, player.name])), [players])
  const assignablePlayers = useMemo(
    () => (assigning ? getAssignablePlayers(players, members, assigning) : []),
    [assigning, members, players],
  )
  const invitablePlayers = useMemo(() => {
    const linkedPlayerIds = new Set(members.map((member) => member.playerId))
    return players.filter((player) => !player.inactive && !linkedPlayerIds.has(player.id))
  }, [members, players])

  const loadingTournaments =
    authLoading ||
    (Boolean(user) &&
      (myTournamentsInit === 'idle' || myTournamentsInit === 'loading' || myTournamentsUid !== user?.uid))

  if (loadingTournaments) {
    return (
      <Container>
        <div className="h-64 rounded-lg bg-gray-200 animate-pulse" aria-busy aria-label="Cargando miembros" />
      </Container>
    )
  }

  if (!user) {
    return (
      <Container>
        <EmptyState
          icon={UserCircleIcon}
          title="Iniciá sesión para ver este torneo"
          action={{ label: 'Entrar', href: '/login' }}
        />
      </Container>
    )
  }

  if (!item) {
    return (
      <Container>
        <EmptyState
          icon={TrophyIcon}
          title="No encontramos este torneo"
          description="Puede que lo hayan eliminado o que no seas miembro."
          action={{ label: 'Ver mis torneos', href: '/tournaments' }}
        />
      </Container>
    )
  }

  const isLoaded = detail.tournamentId === tournamentId && detail.status === 'loaded'
  const hasError = detail.tournamentId === tournamentId && detail.status === 'error'
  const canManage = item.membership.role !== 'MEMBER'

  const handleAssign = async (playerId: string | null) => {
    if (!assigning) return
    await detail.assignMemberPlayer(assigning.uid, playerId)
    if (assigning.uid === user.uid) await loadMyTournaments(user.uid)
    setAssigning(null)
  }

  const handleChangeRole = async (role: InvitationRole) => {
    if (!changingRole) return
    await detail.changeMemberRole(changingRole.uid, role)
    setChangingRole(null)
  }

  const handleInvite = async (input: InvitationInput) => {
    await detail.invite(input, user.uid)
    setInviting(false)
    setInvitedEmail(input.email.trim().toLowerCase())
  }

  const handleRemove = async () => {
    if (!removing) return
    await detail.removeMember(removing.uid, user.uid)
    setRemoving(null)
  }

  return (
    <Container>
      <Link
        href={`/tournaments/${tournamentId}`}
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-700 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        {item.tournament.name}
      </Link>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Miembros</h1>
          <p className="mt-1 text-sm text-gray-700" aria-live="polite">
            {isLoaded
              ? `${members.length} ${members.length === 1 ? 'miembro' : 'miembros'} en el torneo`
              : 'Cargando...'}
          </p>
        </div>
        {canManage && (
          <Button type="button" disabled={!isLoaded} onClick={() => setInviting(true)} className="items-center gap-2">
            <PlusIcon className="h-5 w-5" aria-hidden />
            Agregar miembro
          </Button>
        )}
      </header>

      {invitedEmail && (
        <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Invitamos a <span className="font-medium">{invitedEmail}</span>. Va a aparecer en la lista cuando acepte la
          invitación.
        </p>
      )}

      {hasError && (
        <div role="alert" className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          No se pudieron cargar los miembros del torneo.
        </div>
      )}

      {!isLoaded && !hasError && <div className="h-64 rounded-lg bg-gray-200 animate-pulse" aria-hidden />}

      {isLoaded && (
        <MembersTable
          members={members}
          currentUid={user.uid}
          currentRole={item.membership.role}
          playerNameById={playerNameById}
          onAssignPlayer={setAssigning}
          onChangeRole={setChangingRole}
          onRemove={setRemoving}
        />
      )}

      <Modal open={assigning !== null} onClose={() => setAssigning(null)} title="Cambiar jugador">
        {assigning && (
          <AssignPlayerForm
            key={assigning.uid}
            member={assigning}
            availablePlayers={assignablePlayers}
            onSubmit={handleAssign}
            onCancel={() => setAssigning(null)}
          />
        )}
      </Modal>

      <Modal open={inviting} onClose={() => setInviting(false)} title="Agregar miembro">
        {inviting && (
          <InviteMemberForm
            availablePlayers={invitablePlayers}
            onSubmit={handleInvite}
            onCancel={() => setInviting(false)}
          />
        )}
      </Modal>

      <Modal open={changingRole !== null} onClose={() => setChangingRole(null)} title="Cambiar rol">
        {changingRole && (
          <ChangeRoleForm
            key={changingRole.uid}
            member={changingRole}
            onSubmit={handleChangeRole}
            onCancel={() => setChangingRole(null)}
          />
        )}
      </Modal>

      <TournamentConfirmDialog
        open={removing !== null}
        title="Eliminar miembro"
        message={
          <>
            ¿Seguro que querés eliminar a <span className="font-medium">{removing?.email}</span> del torneo? Va a perder
            el acceso, pero su jugador y sus estadísticas se mantienen.
          </>
        }
        confirmLabel="Eliminar"
        confirmingLabel="Eliminando..."
        errorMessage="No se pudo eliminar al miembro. Intentá de nuevo."
        onCancel={() => setRemoving(null)}
        onConfirm={handleRemove}
      />
    </Container>
  )
}
