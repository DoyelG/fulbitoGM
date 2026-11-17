import { getMessaging, onMessage, type RemoteMessage } from '@react-native-firebase/messaging'
import { Linking } from 'react-native'
import notifee, { EventType } from 'react-native-notify-kit'
import type { Event, FcmRemoteMessage } from 'react-native-notify-kit'

import { ensureNotificationChannels, MATCHES_CHANNEL_ID } from '@/lib/notifications/channels'

export async function configurePushNotificationDisplay(): Promise<void> {
  await notifee.setFcmConfig({ defaultChannelId: MATCHES_CHANNEL_ID })
  await ensureNotificationChannels()
}

export async function displayPushNotification(remoteMessage: FcmRemoteMessage): Promise<void> {
  await ensureNotificationChannels()
  await notifee.handleFcmMessage(remoteMessage)
}

function toPushNotificationRemoteMessage({ messageId, data, notification }: RemoteMessage): FcmRemoteMessage {
  const stringEntries = Object.entries(data ?? {}).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  )
  return {
    messageId,
    data: Object.fromEntries(stringEntries),
    notification: { title: notification?.title, body: notification?.body },
  }
}

export function listenForForegroundPushNotifications(): () => void {
  return onMessage(getMessaging(), (remoteMessage) => {
    displayPushNotification(toPushNotificationRemoteMessage(remoteMessage)).catch(() => undefined)
  })
}

function openNotificationUrl({ type, detail }: Event): void {
  const url = detail.notification?.data?.url
  if (type === EventType.PRESS && typeof url === 'string') Linking.openURL(url).catch(() => undefined)
}

export function listenForNotificationPresses(): () => void {
  notifee.onBackgroundEvent(async (event) => openNotificationUrl(event))
  return notifee.onForegroundEvent(openNotificationUrl)
}
