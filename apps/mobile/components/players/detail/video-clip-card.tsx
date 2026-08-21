import type { Match, VideoClip } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Pressable, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './video-clip-card.styles'

type Props = {
  clip: VideoClip
  match: Match | undefined
  isAdmin: boolean
  onOpen: () => void
  onDelete: () => void
}

export function VideoClipCard({ clip, match, isAdmin, onOpen, onDelete }: Props) {
  const { colors } = useAppTheme()
  const meta = VIDEO_CLIP_CATEGORIES.find(c => c.value === clip.category)
  const label = clip.title || meta?.label || 'Clip'

  const player = useVideoPlayer(clip.url, p => {
    p.muted = true
  })

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={onOpen}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={`Ver clip: ${label}`}>
        <View style={styles.thumbnail}>
          <VideoView
            player={player}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            pointerEvents="none"
          />
          <View style={styles.categoryBadge} pointerEvents="none">
            <ThemedText style={styles.categoryBadgeIcon}>{meta?.icon ?? '🎬'}</ThemedText>
          </View>
        </View>
        <View style={styles.labelBlock}>
          <ThemedText style={[styles.label, { color: colors.text }]} numberOfLines={1}>
            {label}
          </ThemedText>
          {match && (
            <ThemedText style={[styles.date, { color: colors.muted }]}>
              {new Date(match.date).toLocaleDateString()}
            </ThemedText>
          )}
        </View>
      </Pressable>
      {isAdmin && (
        <Pressable
          onPress={onDelete}
          style={[styles.deleteBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar clip: ${label}`}>
          <MaterialIcons name="delete" size={18} color="#fff" />
        </Pressable>
      )}
    </View>
  )
}
