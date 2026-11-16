import { Ionicons } from '@expo/vector-icons'
import { TOURNAMENT_COMMENT_MAX_LENGTH } from '@fulbito/firebase'
import { activeMention, insertMention, suggestMentions, type MentionCandidate } from '@fulbito/utils'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './comment-composer.styles'
import { MentionSuggestions } from './mention-suggestions'

type Selection = { start: number; end: number }

type Props = {
  mentionCandidates: MentionCandidate[]
  onSubmit: (text: string) => Promise<void>
  variant?: 'stacked' | 'bar'
}

export function CommentComposer({ mentionCandidates, onSubmit, variant = 'stacked' }: Props) {
  const { colors } = useAppTheme()
  const [text, setText] = useState('')
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 })
  const [forcedSelection, setForcedSelection] = useState<Selection | undefined>(undefined)
  const [focused, setFocused] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mention = focused ? activeMention(text, Math.min(selection.end, text.length)) : null
  const suggestions = mention ? suggestMentions(mentionCandidates, mention.query) : []
  const trimmed = text.trim()
  const canSend = trimmed.length > 0 && !sending
  const isBar = variant === 'bar'

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

  const chooseMention = (candidate: MentionCandidate) => {
    if (!mention) return
    const next = insertMention(text, mention, candidate.handle)
    const caret = Math.min(next.caret, TOURNAMENT_COMMENT_MAX_LENGTH)
    setText(next.text.slice(0, TOURNAMENT_COMMENT_MAX_LENGTH))
    setSelection({ start: caret, end: caret })
    setForcedSelection({ start: caret, end: caret })
  }

  const input = (
    <TextInput
      value={text}
      onChangeText={setText}
      selection={forcedSelection}
      onSelectionChange={(event) => {
        setSelection(event.nativeEvent.selection)
        setForcedSelection(undefined)
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={isBar ? 'Escribí un mensaje… Usá @' : 'Escribí un comentario… Usá @ para mencionar'}
      placeholderTextColor={colors.muted}
      multiline
      maxLength={TOURNAMENT_COMMENT_MAX_LENGTH}
      style={[
        isBar ? styles.barInput : styles.input,
        { color: colors.text, borderColor: colors.chipBorder, backgroundColor: colors.background },
      ]}
      accessibilityLabel="Escribí un comentario"
      accessibilityHint="Escribí @ para mencionar a alguien del torneo"
    />
  )

  const errorText = error && (
    <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
      {error}
    </Text>
  )

  if (isBar) {
    return (
      <View>
        <MentionSuggestions suggestions={suggestions} onSelect={chooseMention} placement="above" />
        {errorText}
        <View style={styles.barRow}>
          {input}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSend}
            style={[styles.barSendBtn, !canSend ? styles.sendBtnDisabled : null]}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensaje"
            accessibilityState={{ disabled: !canSend, busy: sending }}
          >
            <PrimaryGradient />
            {sending ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Ionicons name="send" size={18} color={colors.onPrimary} />
            )}
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View>
      {input}
      <MentionSuggestions suggestions={suggestions} onSelect={chooseMention} />
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
      {errorText}
    </View>
  )
}
