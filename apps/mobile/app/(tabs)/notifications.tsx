import { resolveRoleRequest, RoleRequestError } from '@fulbito/firebase'
import { useState } from 'react'
import { FlatList, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { NotificationsHeader } from '@/components/notifications/notifications-header'
import { NotificationCard } from '@/components/notifications/notification-card'
import { ThemedView } from '@/components/themed-view'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { usePendingNotifications } from '@/hooks/use-pending-notifications'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from '@/components/notifications/notifications-screen.styles'

export default function NotificationsScreen() {
  const { user } = useFirebaseAuth()
  const { colors } = useAppTheme()
  const { reload, notifications } = usePendingNotifications()
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resolve = async (requestId: string, action: 'accepted' | 'rejected') => {
    if (!user) return
    setResolvingId(requestId)
    setErrorMessage(null)
    try {
      await resolveRoleRequest(requestId, action, user.uid)
    } catch (error) {
      setErrorMessage(
        error instanceof RoleRequestError
          ? error.message
          : 'No se pudo resolver la solicitud. Probá de nuevo más tarde.',
      )
    } finally {
      await reload()
      setResolvingId(null)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ThemedView style={styles.screen}>
        {errorMessage && (
          <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {errorMessage}
          </Text>
        )}
        <FlatList
          data={notifications}
          ListHeaderComponent={<NotificationsHeader pendingCount={notifications.length} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="bell"
              title="No hay notificaciones"
              description="Cuando tengas novedades, las vas a ver acá."
            />
          }
          renderItem={({ item, index }) => (
            <NotificationCard
              notification={item}
              index={index}
              disabled={resolvingId !== null}
              onAccept={() => void resolve(item.data.requestId, 'accepted')}
              onReject={() => void resolve(item.data.requestId, 'rejected')}
            />
          )}
        />
      </ThemedView>
    </SafeAreaView>
  )
}
