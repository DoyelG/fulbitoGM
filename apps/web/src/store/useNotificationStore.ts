import { create } from 'zustand'
import type { RoleRequestNotification } from '@fulbito/types'
import { getPendingNotifications } from '@fulbito/firebase'

type NotificationStore = {
  notifications: RoleRequestNotification[]
  notificationsInit: 'idle' | 'loading' | 'loaded' | 'error'
  loadNotifications: () => Promise<void>
  clearNotifications: () => void
}

let isLoading = false

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  notificationsInit: 'idle',
  loadNotifications: async () => {
    if (isLoading) return
    isLoading = true
    if (get().notificationsInit !== 'loaded') set({ notificationsInit: 'loading' })
    try {
      const data = await getPendingNotifications()
      set({ notifications: data, notificationsInit: 'loaded' })
    } catch {
      set({ notificationsInit: 'error' })
    } finally {
      isLoading = false
    }
  },
  clearNotifications: () => {
    set({ notifications: [], notificationsInit: 'idle' })
  },
}))
