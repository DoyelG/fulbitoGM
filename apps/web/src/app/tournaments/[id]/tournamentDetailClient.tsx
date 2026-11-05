'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import {
  computePlayerStatRows,
  getInvitablePlayers,
  onlyFinalMatches,
  pickCurrentChampion,
  pickNextMatch,
  pickRecentMatches,
  isTournamentAdminRole,
  toLocalDay,
} from '@fulbito/utils'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournamentStore, type TournamentInput } from '@/store/useTournamentStore'
import { useTournamentDetailStore } from '@/store/useTournamentDetailStore'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import TournamentForm from '@/components/tournaments/TournamentForm'
import TournamentHero from '@/components/tournaments/detail/TournamentHero'
import TournamentKpis from '@/components/tournaments/detail/TournamentKpis'
import NextMatchPanel from '@/components/tournaments/detail/NextMatchPanel'
import LeadersPanel from '@/components/tournaments/detail/LeadersPanel'
import RecentMatchesPanel from '@/components/tournaments/detail/RecentMatchesPanel'
import OrganizersPanel from '@/components/tournaments/detail/OrganizersPanel'
import CommentsPanel from '@/components/tournaments/detail/CommentsPanel'
import PlayerRequestsPanel from '@/components/tournaments/detail/PlayerRequestsPanel'
import InvitationsPanel from '@/components/tournaments/detail/InvitationsPanel'

const RECENT_MATCHES_LIMIT = 5

function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="h-48 rounded-xl bg-gray-200 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-20 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-gray-200 animate-pulse" />
    </div>
  )
}

export default function TournamentDetailClient({ tournamentId }: { tournamentId: string }) {
  const { user, loading: authLoading } = useFirebaseAuth()
  const { myTournaments, myTournamentsInit, myTournamentsUid, activeTournamentId, loadMyTournaments } =
    useTournamentStore()
  const setActiveTournament = useTournamentStore((state) => state.setActiveTournament)
  const editTournament = useTournamentStore((state) => state.editTournament)
  const detail = useTournamentDetailStore()
  const [editing, setEditing] = useState(false)

  const item = myTournaments.find(({ tournament }) => tournament.id === tournamentId) ?? null
  const isMember = item !== null
  const loadDetail = detail.load

  useEffect(() => {
    if (!isMember) return
    loadDetail(tournamentId)
  }, [isMember, tournamentId, loadDetail])

  const isModerator = item !== null && isTournamentAdminRole(item.membership.role)
  const isDetailLoaded = detail.tournamentId === tournamentId && detail.status === 'loaded'
  const { loadPlayerRequests, loadInvitations } = detail

  useEffect(() => {
    if (!isModerator || !isDetailLoaded) return
    void loadPlayerRequests(tournamentId)
    void loadInvitations(tournamentId)
  }, [isModerator, isDetailLoaded, tournamentId, loadPlayerRequests, loadInvitations])

  const { players, matches } = detail
  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])
  const playerNameById = useMemo(() => new Map(players.map((player) => [player.id, player.name])), [players])
  const finalMatches = useMemo(() => onlyFinalMatches(matches), [matches])
  const photoByUid = useMemo(() => {
    const photos = new Map<string, string>()
    for (const member of detail.members) {
      const photoUrl = member.playerId ? playerById.get(member.playerId)?.photoUrl : null
      if (photoUrl) photos.set(member.uid, photoUrl)
    }
    return photos
  }, [detail.members, playerById])
  const invitablePlayers = useMemo(() => getInvitablePlayers(players, detail.members), [detail.members, players])
  const statRows = useMemo(() => computePlayerStatRows(players, finalMatches), [players, finalMatches])
  const today = toLocalDay(new Date())
  const nextMatch = useMemo(() => pickNextMatch(matches, today), [matches, today])
  const recentMatches = useMemo(() => pickRecentMatches(matches, RECENT_MATCHES_LIMIT), [matches])
  const champion = useMemo(() => pickCurrentChampion(players, finalMatches), [players, finalMatches])
  const totalGoals = useMemo(() => statRows.reduce((sum, row) => sum + row.goals, 0), [statRows])

  const loadingTournaments =
    authLoading ||
    (Boolean(user) &&
      (myTournamentsInit === 'idle' || myTournamentsInit === 'loading' || myTournamentsUid !== user?.uid))

  if (loadingTournaments) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-busy>
        <DetailSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={UserCircleIcon}
          title="Iniciá sesión para ver este torneo"
          action={{ label: 'Entrar', href: '/login' }}
        />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={TrophyIcon}
          title="No encontramos este torneo"
          description="Puede que lo hayan eliminado o que no seas miembro."
          action={{ label: 'Ver mis torneos', href: '/tournaments' }}
        />
      </div>
    )
  }

  const { tournament, membership } = item
  const authorName = (membership.playerId && playerNameById.get(membership.playerId)) || user.email.split('@')[0]

  const handleEdit = async (data: TournamentInput) => {
    await editTournament(tournament.id, data)
    setEditing(false)
  }

  const handleResolvePlayerRequest = async (uid: string, action: 'accepted' | 'rejected') => {
    await detail.resolvePlayerRequest(uid, action, user.uid)
    if (uid === user.uid && action === 'accepted') await loadMyTournaments(user.uid)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/tournaments"
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-700 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Mis torneos
      </Link>

      <div className="space-y-5">
        <TournamentHero
          item={item}
          active={activeTournamentId === tournament.id}
          onActivate={() => setActiveTournament(tournament.id)}
          onEdit={() => setEditing(true)}
        />

        <TournamentKpis
          champion={champion}
          members={players.length}
          matchesPlayed={finalMatches.length}
          goals={totalGoals}
        />

        {detail.status === 'error' && detail.tournamentId === tournamentId && (
          <div role="alert" className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            No se pudieron cargar los miembros y comentarios del torneo.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <NextMatchPanel
              match={nextMatch}
              tournamentPhotoUrl={tournament.photoUrl ?? null}
              today={today}
              playerById={playerById}
            />
            <LeadersPanel rows={statRows} />
            <RecentMatchesPanel matches={recentMatches} />
          </div>
          <div className="flex flex-col gap-5 lg:min-h-[40rem]">
            {isDetailLoaded && isModerator && (
              <PlayerRequestsPanel
                requests={detail.playerRequests}
                loadFailed={detail.playerRequestsFailed}
                playerNameById={playerNameById}
                onResolve={handleResolvePlayerRequest}
                onRetry={() => loadPlayerRequests(tournamentId)}
              />
            )}
            {isDetailLoaded && isModerator && (
              <InvitationsPanel
                invitations={detail.invitations}
                loadFailed={detail.invitationsFailed}
                onRetry={() => loadInvitations(tournamentId)}
                availablePlayers={invitablePlayers}
                playerNameById={playerNameById}
                onInvite={(input) => detail.invite(input, user.uid)}
                onRevoke={detail.revokeInvitation}
              />
            )}
            {isDetailLoaded && (
              <OrganizersPanel
                members={detail.members}
                currentUid={user.uid}
                playerNameById={playerNameById}
                photoByUid={photoByUid}
                membersHref={`/tournaments/${tournament.id}/members`}
              />
            )}
            {isDetailLoaded && (
              <CommentsPanel
                comments={detail.comments}
                hasMore={detail.commentsCursor !== null}
                photoByUid={photoByUid}
                canModerate={isModerator}
                onSubmit={(text) => detail.addComment(text, { uid: user.uid, name: authorName })}
                onDelete={detail.removeComment}
                onLoadMore={detail.loadMoreComments}
              />
            )}
            {!isDetailLoaded && detail.status !== 'error' && (
              <div className="h-64 rounded-xl bg-gray-200 animate-pulse" aria-hidden />
            )}
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar torneo">
        {editing && (
          <TournamentForm
            initial={{ name: tournament.name, description: tournament.description }}
            initialPhotoUrl={tournament.photoUrl}
            submitLabel="Guardar cambios"
            submittingLabel="Guardando..."
            errorMessage="No se pudo guardar el torneo. Intentá de nuevo."
            onCancel={() => setEditing(false)}
            onSubmit={handleEdit}
          />
        )}
      </Modal>
    </div>
  )
}
