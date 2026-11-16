'use client'

import { useEffect, useMemo } from 'react'
import type { MyTournament } from '@fulbito/types'
import { buildMentionCandidates, isTournamentAdminRole } from '@fulbito/utils'
import CommentsPanel from '@/components/tournaments/detail/CommentsPanel'
import { useCommentsUnreadSince } from '@/hooks/use-comments-unread-since'
import { useLiveTournamentComments } from '@/hooks/use-live-tournament-comments'
import { useTournamentDetailStore } from '@/store/useTournamentDetailStore'
import { useUnreadCommentsStore } from '@/store/useUnreadCommentsStore'

type Props = {
  item: MyTournament
  user: { uid: string; email: string }
}

export default function ProfileCommentsPanel({ item, user }: Props) {
  const tournamentId = item.tournament.id
  const load = useTournamentDetailStore((state) => state.load)
  const detailTournamentId = useTournamentDetailStore((state) => state.tournamentId)
  const status = useTournamentDetailStore((state) => state.status)
  const members = useTournamentDetailStore((state) => state.members)
  const players = useTournamentDetailStore((state) => state.players)
  const comments = useTournamentDetailStore((state) => state.comments)
  const commentsCursor = useTournamentDetailStore((state) => state.commentsCursor)
  const addComment = useTournamentDetailStore((state) => state.addComment)
  const removeComment = useTournamentDetailStore((state) => state.removeComment)
  const loadMoreComments = useTournamentDetailStore((state) => state.loadMoreComments)
  const markSeen = useUnreadCommentsStore((state) => state.markSeen)

  useEffect(() => {
    void load(tournamentId)
  }, [load, tournamentId])

  const isLoaded = detailTournamentId === tournamentId && status === 'loaded'
  const unreadSince = useCommentsUnreadSince(item, user.uid, isLoaded)
  useLiveTournamentComments(tournamentId, isLoaded)

  const photoByUid = useMemo(() => {
    const photoByPlayerId = new Map(players.map((player) => [player.id, player.photoUrl]))
    const photos = new Map<string, string>()
    for (const member of members) {
      const photoUrl = member.playerId ? photoByPlayerId.get(member.playerId) : null
      if (photoUrl) photos.set(member.uid, photoUrl)
    }
    return photos
  }, [members, players])
  const mentionCandidates = useMemo(() => buildMentionCandidates(players, members), [members, players])

  if (detailTournamentId === tournamentId && status === 'error') {
    return (
      <p role="alert" className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-orange-700 shadow-sm">
        No se pudieron cargar los comentarios de {item.tournament.name}.
      </p>
    )
  }

  if (!isLoaded) {
    return <div className="h-64 animate-pulse rounded-xl bg-gray-200" aria-hidden />
  }

  const playerId = item.membership.playerId
  const authorName = (playerId && players.find((player) => player.id === playerId)?.name) || user.email.split('@')[0]

  return (
    <CommentsPanel
      comments={comments}
      hasMore={commentsCursor !== null}
      photoByUid={photoByUid}
      mentionCandidates={mentionCandidates}
      canModerate={isTournamentAdminRole(item.membership.role)}
      onSubmit={async (text) => {
        await addComment(text, { uid: user.uid, name: authorName })
        void markSeen(tournamentId, user.uid)
      }}
      onDelete={removeComment}
      onLoadMore={loadMoreComments}
      unreadSince={unreadSince}
      currentUid={user.uid}
    />
  )
}
