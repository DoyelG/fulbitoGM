import Image from 'next/image'
import { FiAlertTriangle, FiEdit2 } from 'react-icons/fi'
import Button from '@/components/Button'

export type SummaryRow = {
  label: string
  before?: string
  after: string
  beforeImg?: string | null
  afterImg?: string | null
}

type Props = {
  mode: 'create' | 'edit'
  playerName: string
  rows: SummaryRow[]
  saving: boolean
  error: string | null
  linkError: string | null
  onCancel: () => void
  onConfirm: () => void
  onContinue: () => void
}

function PhotoRow({ row }: { row: SummaryRow }) {
  return (
    <div className="flex items-center gap-2">
      <span>{row.label}:</span>
      {row.beforeImg && (
        <Image
          src={row.beforeImg}
          alt="Foto anterior"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover opacity-50 ring-1 ring-gray-300"
        />
      )}
      {row.beforeImg && <span className="text-gray-500">→</span>}
      {row.afterImg ? (
        <Image
          src={row.afterImg}
          alt="Foto nueva"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-primary"
        />
      ) : (
        <span className="font-medium text-black">Sin foto</span>
      )}
    </div>
  )
}

export default function PlayerSaveSummary({
  mode,
  playerName,
  rows,
  saving,
  error,
  linkError,
  onCancel,
  onConfirm,
  onContinue,
}: Props) {
  const actionLabel = mode === 'create' ? 'Guardar jugador' : 'Actualizar jugador'

  if (linkError) {
    return (
      <div className="p-2 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <FiAlertTriangle className="text-amber-700" size={20} aria-hidden />
        </div>
        <p role="alert" className="text-gray-800">
          <span className="font-medium text-gray-900">{playerName}</span> se guardó, pero no se pudo vincular:{' '}
          {linkError}
        </p>
        <div className="mt-6 flex justify-center">
          <Button type="button" block onClick={onContinue}>
            Ir a jugadores
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 text-center" aria-busy={saving}>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <FiEdit2 className="text-primary" size={20} aria-hidden />
      </div>
      <p className="text-gray-700">
        ¿Confirmás {mode === 'edit' ? 'actualizar' : 'guardar'} los datos de{' '}
        <span className="font-medium text-gray-900">{playerName}</span>?
      </p>
      {rows.length > 0 && (
        <div className="mt-3 space-y-1 text-left text-sm text-gray-700">
          {rows.map((row) =>
            row.label === 'Foto' ? (
              <PhotoRow key={row.label} row={row} />
            ) : (
              <p key={row.label}>
                {row.label}:{' '}
                {row.before !== undefined && <span className="text-gray-500 line-through">{row.before}</span>}{' '}
                <span className="font-medium text-black">{row.after}</span>
              </p>
            ),
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-orange-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <Button type="button" variant="secondary" block disabled={saving} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" block disabled={saving} onClick={onConfirm}>
          {saving ? 'Guardando...' : actionLabel}
        </Button>
      </div>
    </div>
  )
}
