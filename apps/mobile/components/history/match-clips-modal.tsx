import type { Match, VideoClip } from '@fulbito/types'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useMemo, useState } from 'react'
import { Alert, Modal, Pressable, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { VideoClipCarousel } from '@/components/players/detail/video-clip-carousel'
import { VideoClipPlaybackModal } from '@/components/video-clip-playback-modal'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './match-clips-modal.styles'

type Props = {
  visible: boolean
  match: Match | null
  clips: VideoClip[]
  isAdmin: boolean
  onDelete: (clipId: string) => Promise<void>
  onAddVideo: () => void
  onClose: () => void
}

export function MatchClipsModal({ visible, match, clips, isAdmin, onDelete, onAddVideo, onClose }: Props) {
  const { colors } = useAppTheme()
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)

  const matchById = useMemo(() => (match ? new Map([[match.id, match]]) : new Map()), [match])

  const handleDelete = (clipId: string) => {
    Alert.alert('Eliminar clip', '¿Eliminar este clip?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete(clipId)
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar el clip.')
          }
        },
      },
    ])
  }

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                Clips{match?.name ? `: ${match.name}` : ''}
              </ThemedText>
              <Pressable
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Cerrar">
                <MaterialIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {isAdmin && (
              <Pressable
                onPress={onAddVideo}
                style={[styles.addVideoBtn, { backgroundColor: colors.brand }]}
                accessibilityRole="button"
                accessibilityLabel="Subir clip">
                <ThemedText style={styles.addVideoBtnText}>+ Subir clip</ThemedText>
              </Pressable>
            )}

            {clips.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialIcons name="movie" size={32} color={colors.muted} />
                <ThemedText style={[styles.emptyText, { color: colors.muted }]}>
                  Sin clips para este partido
                </ThemedText>
              </View>
            ) : (
              <VideoClipCarousel
                clips={clips}
                matchById={matchById}
                isAdmin={isAdmin}
                onOpen={clipId => {
                  const clip = clips.find(c => c.id === clipId)
                  if (clip) setPlaybackUrl(clip.url)
                }}
                onDelete={handleDelete}
              />
            )}
          </View>
        </View>
      </Modal>

      <VideoClipPlaybackModal url={playbackUrl} onClose={() => setPlaybackUrl(null)} />
    </>
  )
}
