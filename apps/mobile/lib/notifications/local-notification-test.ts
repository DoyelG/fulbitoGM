import notifee, { TriggerType } from 'react-native-notify-kit'

import { ensureNotificationChannels, NOTIFICATION_ANDROID_STYLE } from '@/lib/notifications/channels'

const TEST_NOTIFICATION_DELAY_IN_MS = 10_000
const TEST_MAP_TITLE = 'Garden Club'
const TEST_MAP_URL = 'https://maps.app.goo.gl/GEJT41VcfL8Mti1r8'

export async function scheduleTestLocalNotification(): Promise<void> {
  await ensureNotificationChannels()
  await notifee.createTriggerNotification(
    {
      id: 'local-notification-test',
      title: 'Prueba local',
      body: 'Notificación local de prueba',
      android: NOTIFICATION_ANDROID_STYLE,
    },
    { type: TriggerType.TIMESTAMP, timestamp: Date.now() + TEST_NOTIFICATION_DELAY_IN_MS },
  )
}

export async function scheduleTestLocalNotificationWithLink(): Promise<void> {
  await ensureNotificationChannels()
  await notifee.createTriggerNotification(
    {
      id: 'local-notification-link-test',
      title: 'Prueba con enlace',
      body: `Cómo llegar: ${TEST_MAP_TITLE}`,
      data: { url: TEST_MAP_URL },
      android: NOTIFICATION_ANDROID_STYLE,
    },
    { type: TriggerType.TIMESTAMP, timestamp: Date.now() + TEST_NOTIFICATION_DELAY_IN_MS },
  )
}
