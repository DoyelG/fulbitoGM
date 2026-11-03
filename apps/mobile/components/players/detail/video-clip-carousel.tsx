import type { Match, VideoClip } from '@fulbito/types'
import { ScrollView } from 'react-native'

import { VideoClipCard } from '@/components/players/detail/video-clip-card'
import { styles } from './video-clip-carousel.styles'

type Props = {
  clips: VideoClip[]
  matchById: Map<string, Match>
  canDelete: (clip: VideoClip) => boolean
  onOpen: (clipId: string) => void
  onDelete: (clipId: string) => void
}

export function VideoClipCarousel({ clips, matchById, canDelete, onOpen, onDelete }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.track}>
      {clips.map((clip) => (
        <VideoClipCard
          key={clip.id}
          clip={clip}
          match={matchById.get(clip.matchId)}
          canDelete={canDelete(clip)}
          onOpen={() => onOpen(clip.id)}
          onDelete={() => onDelete(clip.id)}
        />
      ))}
    </ScrollView>
  )
}
