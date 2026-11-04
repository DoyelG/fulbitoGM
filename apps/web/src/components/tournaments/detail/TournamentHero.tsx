import Image from 'next/image'
import type { MyTournament } from '@fulbito/types'
import { CheckCircleIcon, PencilSquareIcon, TrophyIcon } from '@heroicons/react/24/outline'
import Button from '@/components/Button'
import { ROLE_LABELS, ROLE_STYLES } from '@/components/tournaments/tournament-roles'

type Props = {
  item: MyTournament
  active: boolean
  onActivate: () => void
  onEdit: () => void
}

const createdAtFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })

export default function TournamentHero({ item, active, onActivate, onEdit }: Props) {
  const { tournament, membership } = item
  const canEdit = membership.role === 'OWNER' || membership.role === 'ADMIN'

  return (
    <header className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:text-left">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-primary/5 sm:h-28 sm:w-28">
          {tournament.photoUrl ? (
            <Image src={tournament.photoUrl} alt="" fill unoptimized sizes="112px" className="object-cover" />
          ) : (
            <TrophyIcon className="absolute inset-0 m-auto h-12 w-12 text-primary" aria-hidden />
          )}
        </div>
        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold text-gray-900 break-words sm:text-3xl">{tournament.name}</h1>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_STYLES[membership.role]}`}
            >
              {ROLE_LABELS[membership.role]}
            </span>
          </div>
          {tournament.description && <p className="mt-2 text-sm text-gray-700 sm:mt-1">{tournament.description}</p>}
          <p className="mt-1 text-xs text-gray-700">Creado en {createdAtFormatter.format(tournament.createdAt)}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-40">
          {active ? (
            <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              <CheckCircleIcon className="h-5 w-5" aria-hidden />
              Torneo activo
            </span>
          ) : (
            <Button type="button" onClick={onActivate} className="items-center gap-1.5">
              <CheckCircleIcon className="h-5 w-5" aria-hidden />
              Activar
            </Button>
          )}
          {canEdit && (
            <Button type="button" variant="secondary" onClick={onEdit} className="items-center gap-1.5">
              <PencilSquareIcon className="h-5 w-5" aria-hidden />
              Editar
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
