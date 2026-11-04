import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import type { Match, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { canDeleteVideoClip } from '@fulbito/utils'
import { useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'

import { VideoClipCarousel } from '@/components/players/detail/video-clip-carousel'
import { VideoClipUploadModal } from '@/components/players/detail/video-clip-upload-modal'
import { ThemedText } from '@/components/themed-text'
import { VideoClipPlaybackModal } from '@/components/video-clip-playback-modal'
import { PrimaryColors } from '@/constants/theme'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { useVideoClipsData } from '@/hooks/use-video-clips-data'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './player-clips-section.styles'
import { PrimaryGradient } from '@/components/primary-gradient'

type Props = {
  playerId: string
  matches: Match[]
  canUpload: boolean
}

export function PlayerClipsSection({ playerId, matches, canUpload }: Props) {
  const { colors } = useAppTheme()
  const { user } = useFirebaseAuth()
  const canManage = useCanManageTournament()
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <ClipFilterChip
          label="Todos"
          accessibilityLabel="Todos los clips"
          selected={clipFilter === 'all'}
          onPress={() => setClipFilter('all')}
        />
        {VIDEO_CLIP_CATEGORIES.map((category) => (
          <ClipFilterChip
            key={category.value}
            label={`${category.icon} ${category.label}`}
            accessibilityLabel={category.label}
            selected={clipFilter === category.value}
            onPress={() => setClipFilter(category.value)}
          />
        ))}
      </ScrollView>

      {canUpload && (
        <Pressable
          onPress={() => setUploadVisible(true)}
          style={styles.uploadButton}
          accessibilityRole="button"
          accessibilityLabel="Subir clip"
        >
          <PrimaryGradient />
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
          canDelete={(clip) => canDeleteVideoClip(clip, user?.uid, canManage)}
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

type ClipFilterChipProps = {
  label: string
  accessibilityLabel: string
  selected: boolean
  onPress: () => void
}

function ClipFilterChip({ label, accessibilityLabel, selected, onPress }: ClipFilterChipProps) {
  const { colors, isDark } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={[
        styles.filterChip,
        selected
          ? { borderColor: PrimaryColors.border }
          : { backgroundColor: colors.chipBg, borderColor: colors.chipBorder },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
    >
      {selected && <PrimaryGradient />}
      <ThemedText
        style={[
          styles.filterChipText,
          { color: selected ? PrimaryColors.onPrimary : isDark ? colors.text : colors.muted },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  )
}
