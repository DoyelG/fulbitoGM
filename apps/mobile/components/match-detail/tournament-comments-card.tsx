import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { TOURNAMENT_COMMENT_MAX_LENGTH } from '@fulbito/firebase'
import type { TournamentComment } from '@fulbito/types'
import { Image } from 'expo-image'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { useAppTheme } from '@/hooks/use-theme'
import type { TournamentCommentsState } from '@/hooks/use-tournament-comments'

import { styles } from './tournament-comments-card.styles'

type Props = {
  state: TournamentCommentsState
  photoByUid: Map<string, string>
  canModerate: boolean
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

function CommentRow({
  comment,
  photoUrl,
  canDelete,
  onDelete,
}: {
  comment: TournamentComment
  photoUrl?: string
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
            <Text style={[styles.author, { color: colors.text }]} numberOfLines={1}>
              {author}
            </Text>
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
        <Text style={[styles.text, { color: colors.textSecondary }]}>{comment.text}</Text>
      </View>
    </View>
  )
}

export function TournamentCommentsCard({ state, photoByUid, canModerate, onSubmit }: Props) {
  const { colors } = useAppTheme()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trimmed = text.trim()
  const canSend = trimmed.length > 0 && !sending

  const handleSubmit = async () => {
    if (!canSend) return
    setSending(true)
    setError(null)
    try {
      await onSubmit(trimmed)
      setText('')
    } catch {
      setError('No se pudo enviar el comentario. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const confirmDelete = (commentId: string) => {
    Alert.alert('Borrar comentario', '¿Borrar este comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          state.removeComment(commentId).catch(() => setError('No se pudo borrar el comentario. Intentá de nuevo.'))
        },
      },
    ])
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Escribí un comentario para el grupo…"
        placeholderTextColor={colors.muted}
        multiline
        maxLength={TOURNAMENT_COMMENT_MAX_LENGTH}
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.chipBorder, backgroundColor: colors.background },
        ]}
        accessibilityLabel="Escribí un comentario"
      />
      <View style={styles.formFooter}>
        <Text style={[styles.counter, { color: colors.muted }]}>
          {text.length}/{TOURNAMENT_COMMENT_MAX_LENGTH}
        </Text>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSend}
          style={[styles.sendBtn, !canSend ? styles.sendBtnDisabled : null]}
          accessibilityRole="button"
          accessibilityLabel="Comentar"
          accessibilityState={{ disabled: !canSend, busy: sending }}
        >
          <PrimaryGradient />
          {sending ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.sendText}>Comentar</Text>}
        </Pressable>
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      <View style={styles.list} accessibilityLiveRegion="polite">
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
    </View>
  )
}
