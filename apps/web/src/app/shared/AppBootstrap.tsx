'use client'

import { useEffect } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

const NOTIFICATIONS_POLLING_INTERVAL_IN_MS = 30_000

export default function AppBootstrap() {
  const { initLoad: initPlayers, playersInit } = usePlayerStore()
  const { initLoad: initMatches, matchesInit } = useMatchStore()
  const { isAdmin } = useFirebaseAuth()
  const { loadNotifications, clearNotifications } = useNotificationStore()

  useEffect(() => {
    if (playersInit === 'idle' || playersInit === 'error') initPlayers()
  }, [playersInit, initPlayers])

  useEffect(() => {
    if (matchesInit === 'idle' || matchesInit === 'error') initMatches()
  }, [matchesInit, initMatches])

  useEffect(() => {
    if (!isAdmin) {
      clearNotifications()
      return
    }
    loadNotifications()
    const intervalId = setInterval(loadNotifications, NOTIFICATIONS_POLLING_INTERVAL_IN_MS)
    return () => clearInterval(intervalId)
  }, [isAdmin, loadNotifications, clearNotifications])

  return null
}
