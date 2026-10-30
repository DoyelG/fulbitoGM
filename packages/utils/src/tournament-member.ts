import type { Player, TournamentMember, TournamentRole } from '@fulbito/types'

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

export function canChangeMemberRole(actorRole: TournamentRole, targetRole: TournamentRole): boolean {
  return actorRole === 'OWNER' && targetRole !== 'OWNER'
}
