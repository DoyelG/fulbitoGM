import type { TournamentPlayerRequestStatus } from '@fulbito/types'
import Button from '@/components/Button'

type RequestRowProps = {
  title: string
  description: string
  status?: TournamentPlayerRequestStatus
  detail?: string
  isSending: boolean
  onRequest: () => void
  onCancel: () => void
}

const statusBadges: Record<TournamentPlayerRequestStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente de aprobación', className: 'bg-amber-100 text-amber-800' },
  rejected: { label: 'Solicitud rechazada', className: 'bg-red-100 text-red-800' },
}

export default function RequestRow({
  title,
  description,
  status,
  detail,
  isSending,
  onRequest,
  onCancel,
}: RequestRowProps) {
  const badge = status && statusBadges[status]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-700">{description}</p>
        {badge && (
          <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        )}
        {detail && <p className="mt-1 text-sm text-gray-700">{detail}</p>}
      </div>
      {status === 'pending' ? (
        <Button type="button" variant="dangerousSecondary" disabled={isSending} onClick={onCancel}>
          Cancelar solicitud
        </Button>
      ) : (
        <Button type="button" disabled={isSending} onClick={onRequest}>
          {status === 'rejected' ? 'Solicitar de nuevo' : 'Solicitar'}
        </Button>
      )}
    </div>
  )
}
