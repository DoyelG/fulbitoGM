'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import type { TournamentComment } from '@fulbito/types'
import { TOURNAMENT_COMMENT_MAX_LENGTH, TOURNAMENT_COMMENTS_PAGE_SIZE } from '@fulbito/firebase'
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline'
import Button from '@/components/Button'
import CommentsPagination from './CommentsPagination'
import DetailSection from './DetailSection'

type Props = {
  comments: TournamentComment[]
  hasMore: boolean
  photoByUid: Map<string, string>
  canModerate: boolean
  onSubmit: (text: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onLoadMore: () => Promise<void>
}

const timeFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function CommentAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
        <Image src={photoUrl} alt="" fill unoptimized sizes="36px" className="object-cover" />
      </span>
    )
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-sm font-semibold text-orange-800"
      aria-hidden
    >
      {name.charAt(0).toUpperCase() || '?'}
    </span>
  )
}

export default function CommentsPanel({
  comments,
  hasMore,
  photoByUid,
  canModerate,
  onSubmit,
  onDelete,
  onLoadMore,
}: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadedPageCount = Math.ceil(comments.length / TOURNAMENT_COMMENTS_PAGE_SIZE)
  const pageCount = Math.max(1, loadedPageCount + (hasMore ? 1 : 0))
  const currentPage = Math.min(page, pageCount - 1)
  const pageComments = comments.slice(
    currentPage * TOURNAMENT_COMMENTS_PAGE_SIZE,
    (currentPage + 1) * TOURNAMENT_COMMENTS_PAGE_SIZE,
  )

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < loadedPageCount || !hasMore) {
      setPage(nextPage)
      return
    }
    setLoadingMore(true)
    setError(null)
    try {
      await onLoadMore()
      setPage(nextPage)
    } catch {
      setError('No se pudieron cargar más comentarios. Intentá de nuevo.')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!text.trim()) return
    setSending(true)
    setError(null)
    try {
      await onSubmit(text)
      setText('')
      setPage(0)
    } catch {
      setError('No se pudo publicar el comentario. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId)
    setError(null)
    try {
      await onDelete(commentId)
    } catch {
      setError('No se pudo borrar el comentario. Intentá de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DetailSection
      id="comments-title"
      title="Comentarios"
      icon={ChatBubbleLeftRightIcon}
      className="flex flex-col lg:min-h-[22rem] lg:flex-1"
    >
      <form onSubmit={handleSubmit} aria-busy={sending}>
        <label htmlFor="tournament-comment" className="sr-only">
          Escribí un comentario
        </label>
        <textarea
          id="tournament-comment"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={TOURNAMENT_COMMENT_MAX_LENGTH}
          rows={3}
          placeholder="Escribí un comentario para el grupo..."
          aria-describedby={error ? 'tournament-comment-error' : 'tournament-comment-count'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span id="tournament-comment-count" className="text-xs text-gray-700">
            {text.length}/{TOURNAMENT_COMMENT_MAX_LENGTH}
          </span>
          <Button type="submit" disabled={sending || !text.trim()}>
            {sending ? 'Publicando...' : 'Comentar'}
          </Button>
        </div>
        {error && (
          <p id="tournament-comment-error" role="alert" className="mt-2 text-sm text-orange-700">
            {error}
          </p>
        )}
      </form>

      {comments.length === 0 ? (
        <p className="mt-5 text-sm italic text-gray-700">Todavía no hay comentarios. ¡Escribí el primero!</p>
      ) : (
        <div
          role="region"
          aria-label="Lista de comentarios"
          tabIndex={0}
          aria-busy={loadingMore}
          className="-mx-1 mt-5 rounded-lg px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[contain:size]"
        >
          <ul className="space-y-4" aria-live="polite">
            {pageComments.map((comment) => {
              return (
                <li key={comment.id} className="flex gap-3">
                  <CommentAvatar name={comment.authorName} photoUrl={photoByUid.get(comment.authorUid)} />
                  <div className="min-w-0 flex-1 rounded-lg bg-gray-50 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">{comment.authorName || 'Miembro'}</span>{' '}
                        <time dateTime={comment.createdAt.toISOString()} className="text-xs text-gray-700">
                          {timeFormatter.format(comment.createdAt)}
                        </time>
                      </p>
                      {canModerate && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          aria-label={`Borrar comentario de ${comment.authorName || 'miembro'}`}
                          title="Borrar comentario"
                          className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden />
                        </button>
                      )}
                    </div>
                    <p className="mt-0.5 whitespace-pre-line break-words text-sm text-gray-800">{comment.text}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <CommentsPagination
        page={currentPage}
        pageCount={pageCount}
        disabled={loadingMore}
        onPageChange={(nextPage) => void handlePageChange(nextPage)}
      />
    </DetailSection>
  )
}
