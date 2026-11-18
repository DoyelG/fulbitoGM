import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import type { TournamentComment } from '@fulbito/types'
import { splitMentions, type MentionCandidate } from '@fulbito/utils'
import { Image } from 'expo-image'
import { useMemo } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { useCommentDeletion } from '@/hooks/use-comment-deletion'
import { useAppTheme } from '@/hooks/use-theme'
import type { TournamentCommentsState } from '@/hooks/use-tournament-comments'

import { CommentComposer } from './comment-composer'
import { OpenMatchCommentActions } from './open-match-comment-actions'

import { styles } from './tournament-comments-card.styles'

type Props = {
  state: TournamentCommentsState
  photoByUid: Map<string, string>
  mentionCandidates: MentionCandidate[]
  canModerate: boolean
  unreadSince: Date | null
  currentUid: string
  onSubmit: (text: string) => Promise<void>
}

const timeFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function CommentAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const { colors } = useAppTheme()
  if (photoUrl) return <Image source={{ uri: photoUrl }} style={styles.avatar} contentFit="cover" accessible={false} />
  return (
    <View style={[styles.avatar, { backgroundColor: colors.secondarySoft }]} accessible={false}>
      <Text style={[styles.avatarText, { color: colors.secondaryText }]}>{name.charAt(0).toUpperCase() || '?'}</Text>
    </View>
  )
}

export function CommentRow({
  comment,
  photoUrl,
  mentionHandles,
  isUnread,
  canDelete,
  onDelete,
}: {
  comment: TournamentComment
  photoUrl?: string
  mentionHandles: ReadonlySet<string>
  isUnread: boolean
  canDelete: boolean
  onDelete: () => void
}) {
  const { colors, isDark } = useAppTheme()
  const author = comment.authorName || 'Miembro'
  return (
    <View style={styles.comment}>
      <CommentAvatar name={author} photoUrl={photoUrl} />
      <View style={[styles.bubble, { backgroundColor: colors.chipBg }]}>
        <View style={styles.bubbleHeader}>
          <View style={styles.authorBlock}>
            <View style={styles.authorRow}>
              {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.secondary }]} />}
              <Text
                style={[styles.author, { color: colors.text }]}
                numberOfLines={1}
                accessibilityLabel={isUnread ? `${author}, sin leer` : undefined}
              >
                {author}
              </Text>
            </View>
            <Text style={[styles.time, { color: colors.muted }]}>{timeFormatter.format(comment.createdAt)}</Text>
          </View>
          {canDelete && (
            <Pressable
              onPress={onDelete}
              style={styles.deleteBtn}
              accessibilityRole="button"
              accessibilityLabel={`Borrar comentario de ${author}`}
            >
              <MaterialIcons name="delete-outline" size={20} color={isDark ? colors.dangerIcon : colors.danger} />
            </Pressable>
          )}
        </View>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {splitMentions(comment.text, mentionHandles).map((segment, index) =>
            segment.mention ? (
              <Text key={index} style={[styles.mention, { color: colors.primaryText }]}>
                {segment.text}
              </Text>
            ) : (
              segment.text
            ),
          )}
        </Text>
        {comment.matchId && <OpenMatchCommentActions matchId={comment.matchId} />}
      </View>
    </View>
  )
}

type ListProps = {
  state: TournamentCommentsState
  photoByUid: Map<string, string>
  mentionCandidates: MentionCandidate[]
  canModerate: boolean
  unreadSince: Date | null
  currentUid: string
}

export function isUnreadComment(comment: TournamentComment, unreadSince: Date | null, currentUid: string): boolean {
  return unreadSince !== null && comment.authorUid !== currentUid && comment.createdAt > unreadSince
}

export function TournamentCommentsList({
  state,
  photoByUid,
  mentionCandidates,
  canModerate,
  unreadSince,
  currentUid,
}: ListProps) {
  const { colors } = useAppTheme()
  const { error, confirmDelete } = useCommentDeletion(state.removeComment)
  const mentionHandles = useMemo(
    () => new Set(mentionCandidates.map((candidate) => candidate.handle)),
    [mentionCandidates],
  )

  return (
    <View style={styles.list} accessibilityLiveRegion="polite">
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
      {state.status === 'loading' && (
        <ActivityIndicator color={colors.primaryText} accessibilityLabel="Cargando comentarios" />
      )}
      {state.status === 'error' && (
        <Pressable onPress={state.reload} accessibilityRole="button" style={styles.retry}>
          <Text style={[styles.empty, { color: colors.muted }]}>
            No se pudieron cargar los comentarios. Tocá para reintentar.
          </Text>
        </Pressable>
      )}
      {state.status === 'loaded' && state.comments.length === 0 && (
        <Text style={[styles.empty, { color: colors.muted }]}>Todavía no hay comentarios. ¡Escribí el primero!</Text>
      )}
      {state.comments.map((comment) => (
        <CommentRow
          key={comment.id}
          comment={comment}
          photoUrl={photoByUid.get(comment.authorUid)}
          mentionHandles={mentionHandles}
          isUnread={isUnreadComment(comment, unreadSince, currentUid)}
          canDelete={canModerate}
          onDelete={() => confirmDelete(comment.id)}
        />
      ))}
      {state.hasMore && (
        <Pressable
          onPress={() => void state.loadMore()}
          disabled={state.loadingMore}
          style={[styles.moreBtn, { backgroundColor: colors.primarySoft }]}
          accessibilityRole="button"
          accessibilityLabel="Ver más comentarios"
        >
          {state.loadingMore ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.moreText, { color: colors.primaryText }]}>Ver más</Text>
          )}
        </Pressable>
      )}
    </View>
  )
}

export function TournamentCommentsCard({
  state,
  photoByUid,
  mentionCandidates,
  canModerate,
  unreadSince,
  currentUid,
  onSubmit,
}: Props) {
  const { colors } = useAppTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <CommentComposer mentionCandidates={mentionCandidates} onSubmit={onSubmit} />
      <View style={styles.listSpacing}>
        <TournamentCommentsList
          state={state}
          photoByUid={photoByUid}
          mentionCandidates={mentionCandidates}
          canModerate={canModerate}
          unreadSince={unreadSince}
          currentUid={currentUid}
        />
      </View>
    </View>
  )
}
