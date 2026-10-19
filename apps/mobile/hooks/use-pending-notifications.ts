import type { RoleRequestNotification } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { getPendingNotifications } from '@fulbito/firebase'

import { useIsAdmin } from '@/hooks/use-is-admin'

const POLLING_INTERVAL_IN_MS = 30_000

export type PendingNotificationsState = {
  notifications: RoleRequestNotification[]
  error: string | null
  reload: () => Promise<void>
}

export function usePendingNotifications(): PendingNotificationsState {
  const isAdmin = useIsAdmin()
  const [notifications, setNotifications] = useState<RoleRequestNotification[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setNotifications(await getPendingNotifications())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error al cargar las notificaciones')
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    void reload()
    const intervalId = setInterval(reload, POLLING_INTERVAL_IN_MS)
    return () => clearInterval(intervalId)
  }, [isAdmin, reload])

  return { notifications: isAdmin ? notifications : [], error, reload }
}
