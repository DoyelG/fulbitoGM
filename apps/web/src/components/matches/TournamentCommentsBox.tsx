'use client'

import { useEffect, useMemo } from 'react'
import { isTournamentAdminRole } from '@fulbito/utils'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { usePlayerStore } from '@/store/usePlayerStore'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import { useTournamentDetailStore } from '@/store/useTournamentDetailStore'
import CommentsPanel from '@/components/tournaments/detail/CommentsPanel'

export default function TournamentCommentsBox() {
  const { user } = useFirebaseAuth()
  const active = useTournamentStore(selectActiveTournament)
  const players = usePlayerStore((state) => state.players)
  const detail = useTournamentDetailStore()
  const tournamentId = active?.tournament.id ?? null
  const isCurrent = tournamentId !== null && detail.tournamentId === tournamentId
  const { load } = detail

  useEffect(() => {
    if (tournamentId && !isCurrent) load(tournamentId)
  }, [tournamentId, isCurrent, load])

  const photoByUid = useMemo(() => {
    const photos = new Map<string, string>()
    for (const member of detail.members) {
      const photoUrl = member.playerId ? players.find((player) => player.id === member.playerId)?.photoUrl : null
      if (photoUrl) photos.set(member.uid, photoUrl)
    }
    return photos
  }, [detail.members, players])

  if (!active || !user) return null

  if (!isCurrent || detail.status !== 'loaded') {
    if (isCurrent && detail.status === 'error') {
      return (
        <p role="alert" className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          No se pudieron cargar los comentarios.
        </p>
      )
    }
    return <div className="h-64 animate-pulse rounded-xl bg-gray-200" aria-hidden />
  }

  const { membership } = active
  const linkedName = membership.playerId ? players.find((player) => player.id === membership.playerId)?.name : null
  const authorName = linkedName || (user.email ?? '').split('@')[0]

  return (
    <CommentsPanel
      comments={detail.comments}
      hasMore={detail.commentsCursor !== null}
      photoByUid={photoByUid}
      canModerate={isTournamentAdminRole(membership.role)}
      onSubmit={(text) => detail.addComment(text, { uid: user.uid, name: authorName })}
      onDelete={detail.removeComment}
      onLoadMore={detail.loadMoreComments}
    />
  )
}
