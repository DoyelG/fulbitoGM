import * as ImagePicker from 'expo-image-picker'
import type { Match, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { useMemo, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './video-clip-upload-modal.styles'

type UploadData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

type Props = {
  visible: boolean
  matches: Match[]
  currentPlayerId: string
  onSubmit: (data: UploadData, fileUri: string) => Promise<void>
  onClose: () => void
}

export function VideoClipUploadModal({ visible, matches, currentPlayerId, onSubmit, onClose }: Props) {
  const { colors } = useAppTheme()
  const [matchId, setMatchId] = useState('')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [category, setCategory] = useState<VideoClipCategory>('highlight')
  const [title, setTitle] = useState('')
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedMatch = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId])
  const suggestedPlayers = useMemo(
    () => (selectedMatch ? [...selectedMatch.teamA, ...selectedMatch.teamB] : []),
    [selectedMatch],
  )

  const selectMatch = (id: string) => {
    setMatchId(id)
    setPlayerIds(id ? [currentPlayerId] : [])
  }

  const togglePlayer = (id: string) => {
    setPlayerIds(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))
  }

  const pickVideo = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus videos para elegir un archivo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] })
    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri)
    }
  }

  const reset = () => {
    setMatchId('')
    setPlayerIds([])
    setCategory('highlight')
    setTitle('')
    setVideoUri(null)
  }

  const canSubmit = matchId !== '' && playerIds.length > 0 && videoUri !== null && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !videoUri) return
    setSubmitting(true)
    try {
      await onSubmit({ matchId, playerIds, category, title: title.trim() || undefined }, videoUri)
      reset()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo subir el clip.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>Subir clip</ThemedText>
            <Pressable
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Cerrar">
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View>
            <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Partido</ThemedText>
            {matches.map(m => (
              <Pressable
                key={m.id}
                onPress={() => selectMatch(m.id)}
                style={[
                  styles.optionRow,
                  { borderColor: matchId === m.id ? colors.brand : colors.border },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Partido ${new Date(m.date).toLocaleDateString()} ${m.type}`}
                accessibilityState={{ selected: matchId === m.id }}>
                <ThemedText style={[styles.optionText, { color: colors.text }]}>
                  {new Date(m.date).toLocaleDateString()} · {m.type}
                </ThemedText>
                {matchId === m.id && <MaterialIcons name="check" size={18} color={colors.brand} />}
              </Pressable>
            ))}
          </View>

          {selectedMatch && (
            <View>
              <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Jugadores en el clip</ThemedText>
              {suggestedPlayers.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => togglePlayer(p.id)}
                  style={styles.playerRow}
                  accessibilityRole="checkbox"
                  accessibilityLabel={p.name}
                  accessibilityState={{ checked: playerIds.includes(p.id) }}>
                  <MaterialIcons
                    name={playerIds.includes(p.id) ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={playerIds.includes(p.id) ? colors.brand : colors.muted}
                  />
                  <ThemedText style={{ color: colors.text }}>{p.name}</ThemedText>
                </Pressable>
              ))}
            </View>
          )}

          <View>
            <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Categoría</ThemedText>
            <View style={styles.categoryRow}>
              {VIDEO_CLIP_CATEGORIES.map(c => (
                <Pressable
                  key={c.value}
                  onPress={() => setCategory(c.value)}
                  style={[
                    styles.categoryChip,
                    { borderColor: category === c.value ? colors.brand : colors.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={c.label}
                  accessibilityState={{ selected: category === c.value }}>
                  <ThemedText>{c.icon}</ThemedText>
                  <ThemedText style={{ color: colors.text }}>{c.label}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Título (opcional)</ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholderTextColor={colors.muted}
            />
          </View>

          <Pressable
            onPress={pickVideo}
            style={[styles.pickBtn, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={videoUri ? 'Video seleccionado, elegir otro' : 'Elegir video'}>
            <ThemedText style={{ color: colors.text }}>
              {videoUri ? 'Video seleccionado ✓ (tocá para cambiar)' : 'Elegir video'}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitBtn, { backgroundColor: colors.brand, opacity: canSubmit ? 1 : 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel="Subir clip"
            accessibilityState={{ disabled: !canSubmit, busy: submitting }}>
            <ThemedText style={styles.submitText}>{submitting ? 'Subiendo...' : 'Subir clip'}</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}
