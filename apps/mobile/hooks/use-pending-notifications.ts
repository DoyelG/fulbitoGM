import type { RoleRequestNotification } from '@fulbito/types'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { getPendingNotifications } from '@fulbito/firebase'

import { useIsAdmin } from '@/hooks/use-is-admin'

const POLLING_INTERVAL_IN_MS = 30_000

export type PendingNotificationsState = {
  notifications: RoleRequestNotification[]
  error: string | null
  reload: () => Promise<void>
}

let sharedNotifications: RoleRequestNotification[] = []
const listeners = new Set<() => void>()

function setSharedNotifications(notifications: RoleRequestNotification[]) {
  sharedNotifications = notifications
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePendingNotifications(): PendingNotificationsState {
  const isAdmin = useIsAdmin()
  const notifications = useSyncExternalStore(subscribe, () => sharedNotifications)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setSharedNotifications(await getPendingNotifications())
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
