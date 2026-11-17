import notifee, { AndroidImportance } from 'react-native-notify-kit'

import { Colors } from '@/constants/theme'

export const MATCHES_CHANNEL_ID = 'matches'

export const SHARED_NOTIFICATION_ANDROID_STYLE = {
  channelId: MATCHES_CHANNEL_ID,
  smallIcon: 'notification_small',
  color: Colors.light.brand,
  pressAction: { id: 'default', launchActivity: 'default' },
} as const

export const NOTIFICATION_ANDROID_STYLE = SHARED_NOTIFICATION_ANDROID_STYLE

export async function ensureNotificationChannels(): Promise<void> {
  await notifee.createChannel({
    id: MATCHES_CHANNEL_ID,
    name: 'Partidos',
    importance: AndroidImportance.HIGH,
  })
}
