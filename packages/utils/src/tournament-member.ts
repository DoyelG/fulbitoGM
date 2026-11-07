import type { InvitationRole, MyTournament, Player, TournamentMember, TournamentRole } from '@fulbito/types'

export const TOURNAMENT_ROLE_LABELS: Record<TournamentRole, string> = {
  OWNER: 'Creador',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
}

export const ASSIGNABLE_ROLES: InvitationRole[] = ['MEMBER', 'ADMIN']

export const TOURNAMENT_ROLE_HINTS: Record<InvitationRole, string> = {
  MEMBER: 'Ve todo el torneo y edita solo su jugador.',
  ADMIN: 'Gestiona jugadores, partidos, invitaciones y miembros.',
}

export function isTournamentAdminRole(role: TournamentRole | null | undefined): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canManageTournamentData(role: TournamentRole | null | undefined, isSuperAdmin: boolean): boolean {
  return isSuperAdmin || isTournamentAdminRole(role)
}

export function canRemoveMember(actorRole: TournamentRole, targetRole: TournamentRole): boolean {
  if (targetRole === 'OWNER') return false
  return actorRole === 'OWNER' || (actorRole === 'ADMIN' && targetRole === 'MEMBER')
}

export function getAssignablePlayers(
  players: Player[],
  members: TournamentMember[],
  member: TournamentMember,
): Player[] {
  const takenIds = new Set(members.filter(({ uid }) => uid !== member.uid).map(({ playerId }) => playerId))
  return players
    .filter((player) => player.id === member.playerId || (!player.inactive && !takenIds.has(player.id)))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function getInvitablePlayers(players: Player[], members: TournamentMember[]): Player[] {
  const takenIds = new Set(members.flatMap(({ playerId }) => (playerId ? [playerId] : [])))
  return players
    .filter((player) => !player.inactive && !takenIds.has(player.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function activeTournamentStorageKey(uid: string): string {
  return `fulbito:activeTournament:${uid}`
}

export function resolveActiveTournamentId(tournaments: MyTournament[], preferredId: string | null): string | null {
  if (preferredId && tournaments.some(({ tournament }) => tournament.id === preferredId)) return preferredId
  return tournaments[0]?.tournament.id ?? null
}

export function hasLinkablePlayers(players: Player[], members: TournamentMember[]): boolean {
  const takenIds = new Set(members.flatMap(({ playerId }) => (playerId ? [playerId] : [])))
  return players.some((player) => !player.inactive && !takenIds.has(player.id))
}

export function canChangeMemberRole(actorRole: TournamentRole, targetRole: TournamentRole): boolean {
  return actorRole === 'OWNER' && targetRole !== 'OWNER'
}
