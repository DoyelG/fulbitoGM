import type { RoleRequest, RoleRequestStatus } from '@fulbito/types'
import Button from '@/components/Button'

type RoleRequestRowProps = {
  title: string
  description: string
  request: RoleRequest | null
  detail?: string
  isSending: boolean
  onRequest: () => void
  onCancel: () => void
}

const statusBadges: Record<RoleRequestStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente de aprobación', className: 'bg-amber-100 text-amber-800' },
  rejected: { label: 'Solicitud rechazada', className: 'bg-red-100 text-red-800' },
  accepted: { label: 'Solicitud aprobada', className: 'bg-green-100 text-green-800' },
}

export default function RoleRequestRow({
  title,
  description,
  request,
  detail,
  isSending,
  onRequest,
  onCancel,
}: RoleRequestRowProps) {
  const status = request?.status
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
        {detail && status !== 'accepted' && <p className="mt-1 text-sm text-gray-700">{detail}</p>}
        {status === 'accepted' && (
          <p className="mt-1 text-sm text-gray-700">Cerrá sesión y volvé a entrar para ver el cambio.</p>
        )}
      </div>
      {status === 'pending' && (
        <Button type="button" variant="dangerousSecondary" disabled={isSending} onClick={onCancel}>
          Cancelar solicitud
        </Button>
      )}
      {status !== 'pending' && status !== 'accepted' && (
        <Button type="button" disabled={isSending} onClick={onRequest}>
          {status === 'rejected' ? 'Solicitar de nuevo' : 'Solicitar'}
        </Button>
      )}
    </div>
  )
}
