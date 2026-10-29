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

let pollingSubscribers = 0
let pollingIntervalId: ReturnType<typeof setInterval> | null = null

async function loadSharedNotifications() {
  setSharedNotifications(await getPendingNotifications())
}

function startPolling() {
  pollingSubscribers += 1
  if (pollingSubscribers > 1) return
  loadSharedNotifications().catch(() => undefined)
  pollingIntervalId = setInterval(() => loadSharedNotifications().catch(() => undefined), POLLING_INTERVAL_IN_MS)
}

function stopPolling() {
  pollingSubscribers -= 1
  if (pollingSubscribers > 0 || !pollingIntervalId) return
  clearInterval(pollingIntervalId)
  pollingIntervalId = null
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
    startPolling()
    return stopPolling
  }, [isAdmin])

  return { notifications: isAdmin ? notifications : [], error, reload }
}
