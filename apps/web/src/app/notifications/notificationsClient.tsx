'use client'

import { useState } from 'react'
import { FiBell } from 'react-icons/fi'
import { resolveRoleRequest, RoleRequestError } from '@fulbito/firebase'
import EmptyState from '@/components/EmptyState'
import GradientHeader from '@/components/GradientHeader'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import NotificationCard from './NotificationCard'
import { useNotificationStore } from '@/store/useNotificationStore'

export default function NotificationsClient() {
  const { user } = useFirebaseAuth()
  const { loadNotifications, notifications } = useNotificationStore()
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
      await loadNotifications()
      setResolvingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <GradientHeader
        leading={
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <FiBell size={28} aria-hidden />
          </div>
        }
        title="Notificaciones"
        subtitle={
          notifications.length === 0
            ? 'Estás al día'
            : `${notifications.length} ${notifications.length === 1 ? 'pendiente' : 'pendientes'}`
        }
      />
      {errorMessage && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand/30 bg-gradient-to-b from-brand/5 to-transparent">
          <EmptyState
            icon={FiBell}
            title="No hay notificaciones"
            description="Cuando tengas novedades, las vas a ver acá."
          />
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              index={index}
              disabled={resolvingId !== null}
              onAccept={() => resolve(notification.data.requestId, 'accepted')}
              onReject={() => resolve(notification.data.requestId, 'rejected')}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
