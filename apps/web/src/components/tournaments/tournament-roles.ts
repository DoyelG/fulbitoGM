import type { TournamentRole } from '@fulbito/types'

export const ROLE_LABELS: Record<TournamentRole, string> = {
  OWNER: 'Creador',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
}

export const ROLE_STYLES: Record<TournamentRole, string> = {
  OWNER: 'bg-brand/10 text-brand ring-brand/30',
  ADMIN: 'bg-amber-50 text-amber-800 ring-amber-300',
  MEMBER: 'bg-gray-100 text-gray-800 ring-gray-300',
}
