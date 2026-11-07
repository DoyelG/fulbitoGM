import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Modal, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { styles } from './video-clip-playback-modal.styles'
import { ContrastColors } from '@/constants/theme'

type Props = {
  url: string | null
  onClose: () => void
}

export function VideoClipPlaybackModal({ url, onClose }: Props) {
  const player = useVideoPlayer(url ?? '', p => {
    p.loop = false
  })

  return (
    <Modal visible={url !== null} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Cerrar reproductor">
          <MaterialIcons name="close" size={28} color={ContrastColors.onColor} />
        </Pressable>
        {url && <VideoView player={player} style={styles.videoView} nativeControls />}
      </SafeAreaView>
    </Modal>
  )
}
