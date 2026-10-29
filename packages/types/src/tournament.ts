export type TournamentRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type InvitationRole = Exclude<TournamentRole, 'OWNER'>

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'revoked'

export type Tournament = {
  id: string
  name: string
  description?: string
  photoUrl?: string
  ownerUid: string
  memberUids: string[]
  deletedAt?: Date
  deletedBy?: string
  createdAt: Date
  updatedAt: Date
}

export type TournamentMember = {
  uid: string
  tournamentId: string
  email: string
  role: TournamentRole
  playerId: string | null
  joinedAt: Date
  updatedAt: Date
}

export type Invitation = {
  id: string
  tournamentId: string
  tournamentName: string
  email: string
  role: InvitationRole
  playerId?: string
  invitedBy: string
  status: InvitationStatus
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type MyTournament = {
  tournament: Tournament
  membership: TournamentMember
}

export type TournamentComment = {
  id: string
  tournamentId: string
  authorUid: string
  authorName: string
  text: string
  createdAt: Date
}
