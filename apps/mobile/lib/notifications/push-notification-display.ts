import { getMessaging, onMessage, type RemoteMessage } from '@react-native-firebase/messaging'
import { Linking } from 'react-native'
import notifee, { EventType, type Event, type FcmRemoteMessage } from 'react-native-notify-kit'

import { ensureNotificationChannels, MATCHES_CHANNEL_ID } from '@/lib/notifications/channels'

const CHAT_PUSH_TYPE = 'chat'

export async function configurePushNotificationDisplay(): Promise<void> {
  await notifee.setFcmConfig({ defaultChannelId: MATCHES_CHANNEL_ID })
  await ensureNotificationChannels()
}

async function displayPushNotification(remoteMessage: FcmRemoteMessage): Promise<void> {
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
    if (remoteMessage.data?.type === CHAT_PUSH_TYPE) return
    displayPushNotification(toPushNotificationRemoteMessage(remoteMessage)).catch(() => undefined)
  })
}

const ALLOWED_URL_HOSTS = new Set(['maps.app.goo.gl', 'maps.google.com', 'www.google.com'])

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' && ALLOWED_URL_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

function openNotificationUrl({ type, detail }: Event): void {
  const url = detail.notification?.data?.url
  if (type === EventType.PRESS && typeof url === 'string' && isAllowedUrl(url)) {
    Linking.openURL(url).catch(() => undefined)
  }
}

notifee.onBackgroundEvent(async (event) => openNotificationUrl(event))

export function listenForNotificationPresses(): () => void {
  return notifee.onForegroundEvent(openNotificationUrl)
}
