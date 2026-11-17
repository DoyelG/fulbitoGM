import { useEffect, useState } from 'react'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { registerPushToken, requestPushPermission, type PushRegistrationStatus } from '@/lib/notifications/push-token'

export type PushTokenState = {
  status: PushRegistrationStatus
  error: string | null
}

export function usePushToken(): PushTokenState {
  const { user } = useFirebaseAuth()

  const userId = user?.uid
  const [state, setState] = useState<PushTokenState>({ status: 'pending', error: null })

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    let stopListening: (() => void) | undefined

    async function register(uid: string) {
      if (!(await requestPushPermission())) {
        if (!cancelled) setState({ status: 'denied', error: null })
        return
      }
      const stop = await registerPushToken(uid)
      if (cancelled) stop()
      else {
        stopListening = stop
        setState({ status: 'registered', error: null })
      }
    }

    register(userId).catch((caught) => {
      if (!cancelled) {
        setState({
          status: 'error',
          error: caught instanceof Error ? caught.message : 'Error al registrar las notificaciones push',
        })
      }
    })

    return () => {
      cancelled = true
      stopListening?.()
    }
  }, [userId])

  return state
}
