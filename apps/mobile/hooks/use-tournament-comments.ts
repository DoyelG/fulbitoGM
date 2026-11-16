import {
  addTournamentComment,
  deleteTournamentComment,
  getTournamentComments,
  subscribeToTournamentCommentsSince,
  type TournamentCommentsCursor,
} from '@fulbito/firebase'
import type { TournamentComment } from '@fulbito/types'
import { useCallback, useEffect, useRef, useState } from 'react'

type Status = 'loading' | 'loaded' | 'error'

const NO_COMMENTS_SINCE = new Date(0)

export type TournamentCommentsState = {
  comments: TournamentComment[]
  status: Status
  hasMore: boolean
  loadingMore: boolean
  reload: () => void
  loadMore: () => Promise<void>
  addComment: (text: string, author: { uid: string; name: string }) => Promise<void>
  removeComment: (commentId: string) => Promise<void>
}

export function useTournamentComments(tournamentId: string | null): TournamentCommentsState {
  const [comments, setComments] = useState<TournamentComment[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [cursor, setCursor] = useState<TournamentCommentsCursor | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const activeId = useRef(tournamentId)
  const [liveSince, setLiveSince] = useState<Date | null>(null)

  useEffect(() => {
    activeId.current = tournamentId
    setComments([])
    setCursor(null)
    setLiveSince(null)
    if (!tournamentId) return
    setStatus('loading')
    let isCurrent = true
    getTournamentComments(tournamentId)
      .then((page) => {
        if (!isCurrent) return
        setComments(page.comments)
        setCursor(page.nextCursor)
        setLiveSince(page.comments[0]?.createdAt ?? NO_COMMENTS_SINCE)
        setStatus('loaded')
      })
      .catch(() => {
        if (isCurrent) setStatus('error')
      })
    return () => {
      isCurrent = false
    }
  }, [tournamentId, reloadKey])

  useEffect(() => {
    if (!tournamentId || !liveSince) return
    let liveIds = new Set<string>()
    return subscribeToTournamentCommentsSince(tournamentId, liveSince, (live) => {
      if (activeId.current !== tournamentId) return
      const previousIds = liveIds
      const nextIds = new Set(live.map((comment) => comment.id))
      liveIds = nextIds
      setComments((current) => [
        ...live,
        ...current.filter((comment) => !nextIds.has(comment.id) && !previousIds.has(comment.id)),
      ])
    })
  }, [tournamentId, liveSince])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const loadMore = useCallback(async () => {
    if (!tournamentId || !cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await getTournamentComments(tournamentId, cursor)
      if (activeId.current !== tournamentId) return
      setComments((current) => [...current, ...page.comments])
      setCursor(page.nextCursor)
    } finally {
      setLoadingMore(false)
    }
  }, [tournamentId, cursor, loadingMore])

  const addComment = useCallback(
    async (text: string, author: { uid: string; name: string }) => {
      if (!tournamentId) throw new Error('No hay torneo activo')
      const comment = await addTournamentComment({ tournamentId, authorUid: author.uid, authorName: author.name, text })
      if (activeId.current === tournamentId) {
        setComments((current) =>
          current.some((existing) => existing.id === comment.id) ? current : [comment, ...current],
        )
      }
    },
    [tournamentId],
  )

  const removeComment = useCallback(
    async (commentId: string) => {
      if (!tournamentId) return
      await deleteTournamentComment(tournamentId, commentId)
      setComments((current) => current.filter((comment) => comment.id !== commentId))
    },
    [tournamentId],
  )

  return { comments, status, hasMore: cursor !== null, loadingMore, reload, loadMore, addComment, removeComment }
}
