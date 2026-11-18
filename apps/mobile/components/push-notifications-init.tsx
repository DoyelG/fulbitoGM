import { useEffect } from 'react'

import { usePushToken } from '@/hooks/use-push-token'
import {
  configurePushNotificationDisplay,
  listenForForegroundPushNotifications,
  listenForNotificationPresses,
} from '@/lib/notifications/push-notification-display'

export default function PushNotificationsInit() {
  usePushToken()

  useEffect(() => {
    configurePushNotificationDisplay().catch(() => undefined)
    const stopListeningForPushes = listenForForegroundPushNotifications()
    const stopListeningForPresses = listenForNotificationPresses()
    return () => {
      stopListeningForPushes()
      stopListeningForPresses()
    }
  }, [])

  return null
}
