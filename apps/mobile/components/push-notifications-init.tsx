import { useRouter } from 'expo-router'
import { useEffect } from 'react'

import { usePushToken } from '@/hooks/use-push-token'
import {
  configurePushNotificationDisplay,
  listenForChatNotificationOpens,
  listenForForegroundPushNotifications,
  listenForNotificationPresses,
} from '@/lib/notifications/push-notification-display'

export default function PushNotificationsInit() {
  usePushToken()
  const router = useRouter()

  useEffect(() => {
    configurePushNotificationDisplay().catch(() => undefined)
    const stopListeningForPushes = listenForForegroundPushNotifications()
    const stopListeningForPresses = listenForNotificationPresses()
    const stopListeningForChatOpens = listenForChatNotificationOpens((tournamentId) =>
      router.navigate({ pathname: '/messages', params: { tournamentId } }),
    )
    return () => {
      stopListeningForChatOpens()
      stopListeningForPushes()
      stopListeningForPresses()
    }
  }, [router])

  return null
}
