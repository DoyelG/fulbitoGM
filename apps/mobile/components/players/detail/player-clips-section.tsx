import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import type { Match, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { canDeleteVideoClip } from '@fulbito/utils'
import { useMemo, useState } from 'react'
import { Alert, Pressable, View } from 'react-native'

import { VideoClipCarousel } from '@/components/players/detail/video-clip-carousel'
import { VideoClipUploadModal } from '@/components/players/detail/video-clip-upload-modal'
import { ThemedText } from '@/components/themed-text'
import { VideoClipPlaybackModal } from '@/components/video-clip-playback-modal'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useVideoClipsData } from '@/hooks/use-video-clips-data'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './player-clips-section.styles'

type Props = {
  playerId: string
  matches: Match[]
  canUpload: boolean
}

export function PlayerClipsSection({ playerId, matches, canUpload }: Props) {
  const { colors } = useAppTheme()
  const { user, isAdmin } = useFirebaseAuth()
  const { videoClips, addVideoClip, deleteVideoClip, error } = useVideoClipsData()
  const [clipFilter, setClipFilter] = useState<VideoClipCategory | 'all'>('all')
  const [uploadVisible, setUploadVisible] = useState(false)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)

  const playerClips = useMemo(
    () => videoClips.filter((clip) => clip.playerIds.includes(playerId)),
    [videoClips, playerId],
  )
  const filteredClips = useMemo(
    () => (clipFilter === 'all' ? playerClips : playerClips.filter((clip) => clip.category === clipFilter)),
    [playerClips, clipFilter],
  )
  const matchById = useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches])

  const handleDeleteClip = (clipId: string, label: string) => {
    Alert.alert('Eliminar clip', `¿Eliminar "${label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void deleteVideoClip(clipId) },
    ])
  }

  return (
    <>
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setClipFilter('all')}
          style={[styles.filterChip, { borderColor: clipFilter === 'all' ? colors.brand : colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Todos los clips"
          accessibilityState={{ selected: clipFilter === 'all' }}
        >
          <ThemedText style={{ color: colors.text }}>Todos</ThemedText>
        </Pressable>
        {VIDEO_CLIP_CATEGORIES.map((category) => (
          <Pressable
            key={category.value}
            onPress={() => setClipFilter(category.value)}
            style={[styles.filterChip, { borderColor: clipFilter === category.value ? colors.brand : colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={category.label}
            accessibilityState={{ selected: clipFilter === category.value }}
          >
            <ThemedText style={{ color: colors.text }}>
              {category.icon} {category.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {canUpload && (
        <Pressable
          onPress={() => setUploadVisible(true)}
          style={[styles.uploadButton, { backgroundColor: colors.brand }]}
          accessibilityRole="button"
          accessibilityLabel="Subir clip"
        >
          <ThemedText style={styles.uploadButtonText}>+ Subir clip</ThemedText>
        </Pressable>
      )}

      {error ? (
        <View
          style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityLiveRegion="polite"
        >
          <MaterialIcons name="error-outline" size={32} color={colors.muted} />
          <ThemedText style={[styles.emptyText, { color: colors.muted }]}>No se pudieron cargar los clips</ThemedText>
        </View>
      ) : filteredClips.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="movie" size={32} color={colors.muted} />
          <ThemedText style={[styles.emptyText, { color: colors.muted }]}>Sin clips para este jugador</ThemedText>
        </View>
      ) : (
        <VideoClipCarousel
          clips={filteredClips}
          matchById={matchById}
          canDelete={(clip) => canDeleteVideoClip(clip, user?.uid, isAdmin)}
          onOpen={(clipId) => {
            const clip = filteredClips.find((item) => item.id === clipId)
            if (clip) setPlaybackUrl(clip.url)
          }}
          onDelete={(clipId) => {
            const clip = filteredClips.find((item) => item.id === clipId)
            handleDeleteClip(clipId, clip?.title || 'clip')
          }}
        />
      )}

      <VideoClipUploadModal
        visible={uploadVisible}
        matches={matches}
        currentPlayerId={playerId}
        onSubmit={async (data, uri) => {
          await addVideoClip(data, uri)
          setUploadVisible(false)
        }}
        onClose={() => setUploadVisible(false)}
      />

      <VideoClipPlaybackModal url={playbackUrl} onClose={() => setPlaybackUrl(null)} />
    </>
  )
}
