import type { Role } from './common'

export type UserProfile = {
  uid: string
  email: string
  role: Role[]
  linkedPlayerId?: string
  createdAt: Date
  updatedAt: Date
}

export type RoleRequestType = Exclude<Role, 'USER'>

export type RoleRequestStatus = 'pending' | 'accepted' | 'rejected'

export type RoleRequest = {
  id: string
  userId: string
  requestedRole: RoleRequestType
  playerId?: string
  newPlayerName?: string
  status: RoleRequestStatus
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
  updatedAt: Date
}
