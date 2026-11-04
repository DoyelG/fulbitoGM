import type { TournamentRole } from '@fulbito/types'

export { TOURNAMENT_ROLE_LABELS as ROLE_LABELS } from '@fulbito/utils'

export const ROLE_STYLES: Record<TournamentRole, string> = {
  OWNER: 'bg-primary/10 text-primary ring-primary/30',
  ADMIN: 'bg-amber-50 text-amber-800 ring-amber-300',
  MEMBER: 'bg-gray-100 text-gray-800 ring-gray-300',
}
