import type { RoleRequestStatus, RoleRequestType } from './user'

export type NotificationAudience = 'ADMIN' | 'USER' | 'PLAYER'

export type NotificationBase = {
  id: string
  audience: NotificationAudience
  status: RoleRequestStatus
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export type RoleRequestNotification = NotificationBase & {
  type: 'ROLE_REQUEST'
  data: {
    requestId: string
    userId: string
    userEmail: string
    requestedRole: RoleRequestType
    playerId?: string
    playerName?: string
  }
}

export type InfoNotification = NotificationBase & {
  type: 'INFO'
  data: {
    matchId: string
    matchDate: Date
    message: string
  }
}

export type Notification = RoleRequestNotification | InfoNotification

export type NotificationType = Notification['type']
