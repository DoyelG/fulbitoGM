import type { MyTournament, TournamentRole } from '@fulbito/types'
import { TrophyIcon } from '@heroicons/react/24/outline'

const ROLE_LABELS: Record<TournamentRole, string> = {
  OWNER: 'Creador',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
}

const ROLE_STYLES: Record<TournamentRole, string> = {
  OWNER: 'bg-brand/10 text-brand ring-brand/30',
  ADMIN: 'bg-amber-50 text-amber-800 ring-amber-300',
  MEMBER: 'bg-gray-100 text-gray-800 ring-gray-300',
}

type Props = {
  item: MyTournament
}

export default function TournamentCard({ item: { tournament, membership } }: Props) {
  return (
    <article className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-lg p-2.5 bg-white ring-1 ring-gray-200 shadow-sm">
          <TrophyIcon className="h-6 w-6 text-indigo-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 break-words">{tournament.name}</h2>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_STYLES[membership.role]}`}
            >
              {ROLE_LABELS[membership.role]}
            </span>
          </div>
          {tournament.description && <p className="mt-1 text-sm text-gray-700">{tournament.description}</p>}
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
            <div className="flex gap-1">
              <dt>Miembros:</dt>
              <dd className="font-medium text-gray-900">{tournament.memberUids.length}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Tu jugador:</dt>
              <dd className="font-medium text-gray-900">{membership.playerId ? 'Vinculado' : 'Sin vincular'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  )
}
