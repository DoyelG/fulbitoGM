import { FiCheck, FiLink, FiShield, FiX } from 'react-icons/fi'
import PlayerAvatar from '@/components/home/PlayerAvatar'
import type { RoleRequestNotification } from '@fulbito/types'
import { getRoleRequestLabel, getRoleRequestSummary, getTimeAgo } from '@fulbito/utils'

type NotificationCardProps = {
  notification: RoleRequestNotification
  index: number
  disabled: boolean
  onAccept: () => void
  onReject: () => void
}

export default function NotificationCard({ notification, index, disabled, onAccept, onReject }: NotificationCardProps) {
  const { userEmail, requestedRole } = notification.data
  const isAdminRequest = requestedRole === 'ADMIN'
  const TypeIcon = isAdminRequest ? FiShield : FiLink

  return (
    <li
      style={{ animationDelay: `${index * 80}ms` }}
      className="animate-fade-up group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${isAdminRequest ? 'bg-accent' : 'bg-brand'}`} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-4">
          <PlayerAvatar name={userEmail} size="md" />
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isAdminRequest ? 'bg-orange-100 text-orange-800' : 'bg-violet-100 text-violet-800'
                }`}
              >
                <TypeIcon aria-hidden />
                {getRoleRequestLabel(notification)}
              </span>
              <span className="text-xs text-gray-600">{getTimeAgo(notification.createdAt)}</span>
            </div>
            <p className="truncate font-semibold text-gray-900">{userEmail}</p>
            <p className="text-sm text-gray-700">{getRoleRequestSummary(notification)}</p>
          </div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={onReject}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX aria-hidden />
            Rechazar
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onAccept}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck aria-hidden />
            Aceptar
          </button>
        </div>
      </div>
    </li>
  )
}
