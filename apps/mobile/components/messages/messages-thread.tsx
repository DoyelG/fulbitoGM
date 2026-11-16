import type { TournamentComment } from '@fulbito/types'
import type { MentionCandidate } from '@fulbito/utils'
import { useMemo, useState, type Ref } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'

import { CommentRow, isUnreadComment } from '@/components/match-detail/tournament-comments-card'
import { useCommentDeletion } from '@/hooks/use-comment-deletion'
import { useAppTheme } from '@/hooks/use-theme'
import type { TournamentCommentsState } from '@/hooks/use-tournament-comments'

import { styles } from './messages-thread.styles'

type Props = {
  ref?: Ref<FlatList<TournamentComment>>
  state: TournamentCommentsState
  photoByUid: Map<string, string>
  mentionCandidates: MentionCandidate[]
  canModerate: boolean
  unreadSince: Date | null
  currentUid: string
}

function ThreadEmpty({ state }: { state: TournamentCommentsState }) {
  const { colors } = useAppTheme()
  if (state.status === 'loading') {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color={colors.primaryText} accessibilityLabel="Cargando mensajes" />
      </View>
    )
  }
  if (state.status === 'error') {
    return (
      <Pressable
        onPress={state.reload}
        style={styles.placeholder}
        accessibilityRole="button"
        accessibilityLabel="No se pudieron cargar los mensajes. Tocá para reintentar"
      >
        <Text style={[styles.placeholderText, { color: colors.muted }]}>
          No se pudieron cargar los mensajes. Tocá para reintentar.
        </Text>
      </Pressable>
    )
  }
  return (
    <View style={styles.placeholder}>
      <Text style={[styles.placeholderText, { color: colors.muted }]}>
        Todavía no hay mensajes. ¡Escribí el primero!
      </Text>
    </View>
  )
}

export function MessagesThread({
  ref,
  state,
  photoByUid,
  mentionCandidates,
  canModerate,
  unreadSince,
  currentUid,
}: Props) {
  const { colors } = useAppTheme()
  const { error: deleteError, confirmDelete } = useCommentDeletion(state.removeComment)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const mentionHandles = useMemo(
    () => new Set(mentionCandidates.map((candidate) => candidate.handle)),
    [mentionCandidates],
  )
  const error = deleteError ?? loadMoreError

  const loadOlder = () => {
    if (!state.hasMore || state.loadingMore || state.status !== 'loaded') return
    setLoadMoreError(null)
    state.loadMore().catch(() => setLoadMoreError('No se pudieron cargar mensajes anteriores.'))
  }

  if (state.comments.length === 0) {
    return (
      <View style={styles.list}>
        {error && <Text style={[styles.error, styles.emptyError, { color: colors.danger }]}>{error}</Text>}
        <ThreadEmpty state={state} />
      </View>
    )
  }

  return (
    <FlatList
      ref={ref}
      inverted
      data={state.comments}
      extraData={unreadSince}
      keyExtractor={(comment) => comment.id}
      renderItem={({ item }) => (
        <CommentRow
          comment={item}
          photoUrl={photoByUid.get(item.authorUid)}
          mentionHandles={mentionHandles}
          isUnread={isUnreadComment(item, unreadSince, currentUid)}
          canDelete={canModerate}
          onDelete={() => confirmDelete(item.id)}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      onEndReached={loadOlder}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        error ? (
          <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : undefined
      }
      ListFooterComponent={
        state.loadingMore ? (
          <ActivityIndicator
            style={styles.loadingOlder}
            color={colors.primaryText}
            accessibilityLabel="Cargando mensajes anteriores"
          />
        ) : undefined
      }
    />
  )
}
