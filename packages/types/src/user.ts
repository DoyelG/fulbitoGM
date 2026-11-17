import type { Role } from './common'

export type UserProfile = {
  uid: string
  email: string
  role: Role[]
  linkedPlayerId?: string
  createdAt: Date
  updatedAt: Date
}
