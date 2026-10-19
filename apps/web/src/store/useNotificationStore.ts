import { create } from 'zustand'
import type { RoleRequestNotification } from '@fulbito/types'
import { getPendingNotifications } from '@fulbito/firebase'

type NotificationStore = {
  notifications: RoleRequestNotification[]
  notificationsInit: 'idle' | 'loading' | 'loaded' | 'error'
  loadNotifications: () => Promise<void>
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  notificationsInit: 'idle',
  loadNotifications: async () => {
    try {
      const data = await getPendingNotifications()
      set({ notifications: data, notificationsInit: 'loaded' })
    } catch {
      set({ notificationsInit: 'error' })
    }
  },
  clearNotifications: () => {
    set({ notifications: [], notificationsInit: 'idle' })
  },
}))
