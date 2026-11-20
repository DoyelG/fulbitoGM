import type { MembershipRef } from '@fulbito/types'

export type LinkedMembership = { tournamentId: string; playerId: string }

export function linkedMemberships(memberships: MembershipRef[]): LinkedMembership[] {
  return memberships.filter(
    (membership): membership is LinkedMembership => typeof membership.playerId === 'string',
  )
}
